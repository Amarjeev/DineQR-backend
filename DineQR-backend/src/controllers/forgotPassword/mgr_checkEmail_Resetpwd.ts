import { Router, Request, Response } from "express";
import managerProfileModel from "../../models/manager/mgr_ProfileSchemaModel";
import { redis } from "../../config/redis";
import { sendEmail } from "../../services/sendEmail";
import mgrForgotPasswordTemplate from "../../emailTemplates/mgr_forgotPasswordUI";

const mgr_checkEmail_Resetpwd_Router = Router();

/**
 * @route   POST /api/v1/forgot-password/check-email
 * @desc    Step 1 of Manager Password Reset - Validate email & send OTP
 * @access  Public
 *
 * Request Body:
 * {
 *   email: string   // Manager's email address
 * }
 *
 * Process:
 *  0. Validate request body
 *  1. Check if manager email exists in Redis cache
 *  2. If not cached → check in MongoDB (managerProfileModel)
 *  3. Generate OTP and prepare email template
 *  4. Store OTP in Redis (expires in 3 minutes)
 *  5. Respond to client (account verified, OTP sent)
 *  6. Send OTP email asynchronously
 *
 * Response:
 * 200 -> { success: true, message: "Account verification done. OTP sent to your email." }
 * 400 -> { success: false, message: "Email is required" }
 * 404 -> { success: false, message: "Invalid account found" }
 * 500 -> { success: false, message: "Server error. Please try again later." }
 */
mgr_checkEmail_Resetpwd_Router.post(
  "/api/v1/forgot-password/check-email",
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // ================================
      // 0. Validate request body
      // ================================
      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      // ================================
      // 1. Check if manager exists in Redis cache
      // ================================

      // Define the interface
      interface redisData {
        email: string;
      }

      const cachedEmail = await redis.get(`manager:data:${email}`);
      const userData =  cachedEmail as redisData;

      let manager;
      if (!cachedEmail) {
        // If not in cache, fetch from MongoDB
        manager = await managerProfileModel
          .findOne({ email, isDeleted: false })
          .select("email")
          .lean();

        if (!manager) {
          res.status(404).json({
            success: false,
            message: "Invalid account found",
          });
          return;
        }

        // Optional: Cache manager email in Redis for 1 hour
        await redis.set(`manager:data:${email}`, manager.email, { ex: 3600 });
      }

      // ================================
      // 2. Determine email to use (Redis or DB)
      // ================================
      const managerEmail = userData?.email || manager?.email;

      // ================================
      // 3. Generate OTP and email template
      // ================================
      const { Otp, html } = mgrForgotPasswordTemplate(managerEmail as string);

      // Store OTP in Redis with 3-minute expiry
      await redis.set(`mgr:reset-password-otp:${email}`, Otp, { ex: 180 });

      // ================================
      // 4. Respond to client
      // ================================
      res.status(200).json({
        success: true,
        message: "Account verification done. OTP sent to your email.",
      });

      // ================================
      // 5. Send OTP email asynchronously
      // ================================
      await sendEmail({
        toEmail: managerEmail as string,
        subject: "DineQR Manager Reset-Password OTP",
        htmlContent: html,
      });
    } catch (error) {
      console.error("Forgot Password Error:", error);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  }
);

export default mgr_checkEmail_Resetpwd_Router;
