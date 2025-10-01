import dotenv from "dotenv";
import { Router, Request, Response } from "express";
import { redis } from "../../config/redis";
import { sendEmail } from "../../services/sendEmail";
import mgr_LoginOtpUI from "../../emailTemplates/mgr_LoginOtpUI";
import { generateToken } from "../../utils/generate_jwtToken";

const Mgr_OtpVerification_Router = Router();

dotenv.config();

Mgr_OtpVerification_Router.post(
  "/api/v1/auth/manager/verify-otp",
  async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;

      // ================================
      // 1. Validate request body
      // ================================
      if (!email || !otp) {
        return res.status(422).json({
          success: false,
          message: "Email and OTP are required",
        });
      }

      // ================================
      // 2. Get OTP from Redis
      // ================================
      const savedOtp = await redis.get(`Mgr_otp:${email}`);

      if (!savedOtp) {
        return res.status(400).json({
          success: false,
          message: "OTP expired or invalid",
        });
      }

      // ================================
      // 3. Compare OTP
      // ================================
      if (String(savedOtp) !== String(otp)) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }
      // ================================
      // 4. Generate JWT token
      // ================================

      // Define the shape of the manager data stored in Redis
      interface redisData {
        _id: string; // Manager unique ID
        email: string; // Manager email
        role: string; // Manager role
      }

      // Retrieve the manager data from Redis
      const userDataString = await redis.get(`manager:data:${email}`);

      // Typecast the retrieved string to the Redis data structure
      const userData = userDataString as redisData;

      // Generate a JWT token using the manager's ID, email, and role
      const token = generateToken({
        hotelKey: userData._id,
        email: userData.email,
        userId: userData._id,
        role: userData.role,
      });

      // Set the JWT token in an HTTP-only cookie for secure browser storage
      res.cookie("manager_Token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 5 * 24 * 60 * 60 * 1000,
      });

      // ================================
      // 5. OTP verified successfully
      // ================================
      await redis.del(`Mgr_otp:${email}`);
      await redis.del(`manager:data:${email}`);

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    } catch (error) {
      console.error("❌ OTP verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error, please try again later",
      });
    }
  }
);

/**
 * Manager Resend OTP Route
 * -------------------------
 * @route   POST /api/v1/auth/manager/Resend-otp
 * @desc    Resend OTP to manager email
 * @access  Public
 */
Mgr_OtpVerification_Router.post(
  "/api/v1/auth/manager/Resend-otp",
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // ================================
      // 1. Validate request body
      // ================================
      if (!email) {
        return res.status(422).json({
          success: false,
          message: "Email is required",
        });
      }

      // ================================
      // 2. Generate OTP and email content
      // ================================
      const { Otp, html } = mgr_LoginOtpUI(email);

      // ================================
      // 3. Store OTP in Redis with 3-minute expiry
      // ================================
      await redis.set(`Mgr_otp:${email}`, Otp, { ex: 180 });

      // ================================
      // 4. Send OTP email to manager
      // ================================
      await sendEmail({
        toEmail: email,
        subject: "DineQR Manager OTP",
        htmlContent: html,
      });

      // ================================
      // 5. Respond with success
      // ================================
      return res.status(200).json({
        success: true,
        message: "OTP resent successfully",
      });
    } catch (error) {
      // ================================
      // 6. Error handling
      // ================================
      console.error("❌ Resend OTP error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error, please try again later",
      });
    }
  }
);

export default Mgr_OtpVerification_Router;
