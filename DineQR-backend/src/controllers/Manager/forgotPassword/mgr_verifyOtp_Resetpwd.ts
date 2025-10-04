import { Router, Request, Response } from "express";
import { redis } from "../../../config/redis";

const mgr_verifyOtp_Resetpwd_Router = Router();

/**
 * @route   POST /api/v1/forgot-password/verify-otp
 * @desc    Verify OTP for manager reset-password flow
 * @access  Public
 *
 * Request Body:
 * {
 *   email: string,   // Manager's email address
 *   otp: string      // 6-digit OTP entered by the manager
 * }
 *
 * Response:
 * 200 -> { success: true, message: "OTP verified successfully" }
 * 400 -> { success: false, message: "Invalid OTP" }
 * 404 -> { success: false, message: "OTP expired or not found" }
 * 500 -> { success: false, message: "Internal server error" }
 */
mgr_verifyOtp_Resetpwd_Router.post(
  "/api/v1/forgot-password/verify-otp",
  async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;

      // Retrieve OTP from Redis using manager email
      const savedOtp = await redis.get(`mgr:reset-password-otp:${email}`);

      // Case: OTP not found (expired or never generated)
      if (!savedOtp) {
        return res.status(404).json({
          success: false,
          message: "OTP expired or not found",
        });
      }

      // Case: Entered OTP does not match saved OTP
      if (String(otp) !== String(savedOtp)) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      // OTP is valid -> remove it from Redis
      await redis.del(`mgr:reset-password-otp:${email}`);

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export default mgr_verifyOtp_Resetpwd_Router;
