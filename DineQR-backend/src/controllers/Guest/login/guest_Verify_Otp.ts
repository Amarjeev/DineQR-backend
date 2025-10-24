import { Router, Request, Response } from "express";
import Guest_Profile_Schema from "../../../models/guest/guest_ProfileSchemaModel";
import { generateToken } from "../../../utils/generate_jwtToken";
import { redis } from "../../../config/redis";

const guest_Verify_Otp_Router = Router();

/**
 * ========================================================
 * Route: POST /api/v1/auth/login/verify-otp
 * Purpose: Verify guest OTP and issue login token
 * ========================================================
 */
guest_Verify_Otp_Router.post(
  "/api/v1/auth/login/verify-otp",
  async (req: Request, res: Response) => {
    try {
      const { mobileNumber, hotelKey, otp } = req.body;

      // 🔹 Validate input
      if (!mobileNumber || !hotelKey || !otp) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: mobileNumber, hotelKey, or otp",
        });
      }

      if (otp.length !== 6) {
        return res.status(401).json({
          success: false,
          message: "Invalid OTP length. OTP must be 6 digits.",
        });
      }

      // 🔹 Fetch OTP from Redis
      const originalOtp = await redis.get(
        `Guest_Login_otp:${mobileNumber}:${hotelKey}`
      );

      if (!originalOtp) {
        return res.status(401).json({
          success: false,
          message: "OTP expired or not found. Please request a new one.",
        });
      }

      if (Number(otp) !== Number(originalOtp)) {
        return res.status(401).json({
          success: false,
          message: "Incorrect OTP. Please try again.",
        });
      }

      // 🔹 OTP verified — remove it from Redis to prevent reuse
      await redis.del(`Guest_Login_otp:${mobileNumber}:${hotelKey}`);

      // 🔹 Generate JWT token
      const token = generateToken({
        hotelKey,
        userId: mobileNumber,
        role: "guest",
      });

      if (!token) {
        return res.status(500).json({
          success: false,
          message: "Server error: Could not generate authentication token",
        });
      }

      // 🔹 Set HTTP-only cookie (secure session)
      res.cookie("guest_Token", token, {
        httpOnly: true, // Prevent XSS
        secure: true, // HTTPS only
        sameSite: "strict", // CSRF protection
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
      });

      // 🔹 Check if guest already exists
      let user = await Guest_Profile_Schema.findOne({ mobileNumber });

      if (!user) {
        user = new Guest_Profile_Schema({
          mobileNumber,
          hotelOrders: [],
          currentOrders: [],
        });
        await user.save();
      }

      // ✅ Success
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully. Login complete.",
      });
    } catch (error: any) {
      console.error("❌ OTP Verification Error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error, please try again later.",
        error: error.message,
      });
    }
  }
);

export default guest_Verify_Otp_Router;
