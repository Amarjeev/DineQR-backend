import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import manager_profileModel from "../../models/manager/mgr_ProfileSchemaModel";
import { redis } from "../../config/redis";
import { sendEmail } from "../../services/sendEmail";
import mgr_LoginOtpUI from "../../emailTemplates/mgr_LoginOtpUI";


const loginManagerRouter = Router();

/**
 * Manager Login Route
 * --------------------
 * @route   POST /api/v1/auth/login/manager
 * @desc    Authenticate a manager using email and password
 * @access  Public
 */
loginManagerRouter.post(
  "/api/v1/auth/login/manager",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // ================================
      // 1. Validate request body
      // ================================
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "All fields are required",
        });
        return;
      }

      // Define Redis cached user data structure
      interface redisData {
        _id: string;
        email: string;
        password: string;
      }

      // ================================
      // 2. Check if user exists in Redis cache
      // ================================
      const userDataString = await redis.get(email);

      let manager;
      if (!userDataString) {
        // If not in cache, fetch from MongoDB
        manager = await manager_profileModel
          .findOne({ email, isDeleted: false })
          .select("email password") // include password for bcrypt comparison
          .lean();

        // If no user found, return error
        if (!manager) {
          res.status(404).json({
            success: false,
            message: "Invalid email or password",
          });
          return;
        }
      }

      // ================================
      // 3. Get password (from Redis or DB)
      // ================================
      const userData = userDataString as redisData;
      const savedPassword = manager?.password || userData?.password;

      // Compare provided password with hashed password
      const isMatch = await bcrypt.compare(password, savedPassword);
      if (!isMatch) {
        res.status(404).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }
     
      // ================================
      // 4. Generate OTP and send email
      // ================================
      const { Otp, html } = mgr_LoginOtpUI(email);

      // Store OTP in Redis with 3-minute expiry
      await redis.set(`Mgr_otp:${email}`, Otp, { ex: 180 });

      // Send OTP email to manager
      await sendEmail({
        toEmail: email,
        subject: "DineQR Manager OTP",
        htmlContent: html,
      });

      // ================================
      // 5. Login successful
      // ================================
      res.status(200).json({
        success: true,
        message: "Login successful",
      });
    } catch (error) {
      // ================================
      // 6. Error handling
      // ================================
      console.error("❌ Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error, please try again later",
      });
    }
  }
);

export default loginManagerRouter;
