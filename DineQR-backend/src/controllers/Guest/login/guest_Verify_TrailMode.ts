import { Router, Request, Response } from "express";
import Guest_Profile_Schema from "../../../models/guest/guest_ProfileSchemaModel";
import { generateToken } from "../../../utils/generate_jwtToken";

const guest_Verify_TrailMode_Router = Router();

/**
 * POST /api/v1/auth/login/verify/trail-mode
 * Trial mode login — skips OTP and creates guest session.
 */
guest_Verify_TrailMode_Router.post(
  "/api/v1/auth/login/verify/trail-mode",
  async (req: Request, res: Response) => {
    try {
      const { mobileNumber, hotelKey } = req.body;

      // Validate input
      if (!mobileNumber || !hotelKey) {
        return res.status(400).json({
          success: false,
          message: "Missing mobileNumber or hotelKey",
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

      // Generate guest token
      const token = generateToken({
        hotelKey,
        userId: mobileNumber,
        role: "guest",
      });

      if (!token) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate token",
        });
      }

      // Set secure cookie
      res.cookie("guest_Token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 5 * 60 * 60 * 1000,
      });

      // Create guest if not exists
      let user = await Guest_Profile_Schema.findOne({ mobileNumber });
      if (!user) {
        user = new Guest_Profile_Schema({
          mobileNumber,
          hotelOrders: [],
          currentOrders: [],
        });
        await user.save();
      }

      // Success response
      return res.status(200).json({
        success: true,
        message: "Trial mode login successful",
      });
    } catch (error: any) {
      console.error("Trial mode error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default guest_Verify_TrailMode_Router;
