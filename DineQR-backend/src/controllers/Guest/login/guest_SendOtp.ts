import { Router, Response, Request } from "express";
import dotenv from "dotenv";
import twilio from "twilio";
import { generateOtp } from "../../../utils/otpGenerator";
import { redis } from "../../../config/redis";

dotenv.config();

const guest_SendOtp_Router = Router();

// Initialize Twilio client
const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_TOKEN!);

/**
 * ========================================================
 * Route: POST /api/v1/auth/login/send-otp
 * Purpose: Send OTP to guest mobile number for verification
 * ========================================================
 */
guest_SendOtp_Router.post(
  "/api/v1/auth/login/send-otp",
  async (req: Request, res: Response) => {
    try {
      const { mobileNumber, hotelKey } = req.body;

      // 🔹 Basic validation
      if (!mobileNumber || !hotelKey) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: mobileNumber or hotelKey",
        });
      }

      // 🔹 Check valid Indian number format (+91XXXXXXXXXX)
      const phoneRegex = /^\+91\d{10}$/;
      if (!phoneRegex.test(mobileNumber)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid mobile number format. Use +91 followed by 10 digits.",
        });
      }

      // 🔹 Generate OTP
      const otp = generateOtp(6);

      // 🔹 Send OTP via Twilio
      await client.messages.create({
        body: `Your DineQR verification code is ${otp}. It is valid for 3 minutes. Do not share this code with anyone.`,
        from: process.env.TWILIO_FROM!,
        to: mobileNumber,
      });

      // 🔹 Store OTP in Redis (expires in 3 minutes)
      await redis.set(`Guest_Login_otp:${mobileNumber}:${hotelKey}`, otp, {
        ex: 180,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (err: any) {
      console.error("Twilio OTP Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
        error: err.message,
      });
    }
  }
);

export default guest_SendOtp_Router;
