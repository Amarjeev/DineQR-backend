import { Router, Response } from "express";
import { ManagerRequest } from "../../../types/manager";
// import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import ManagerProfileSchema from "../../../models/manager/mgr_ProfileSchemaModel";
import bcrypt from "bcryptjs";

import { redis } from "../../../config/redis";
import { sendEmail } from "../../../services/sendEmail";
import mgr_DeleteAccountOtpUI from "../../../emailTemplates/mgr_DeleteAccountOtpUI";

const mgr_Request_deleteAccount_Router = Router();

mgr_Request_deleteAccount_Router.post(
  "/api/v1/manager/request/delete/account",
  // verifyToken("manager"),
  async (req: ManagerRequest, res: Response) => {
    try {
      // const hotelKey = req.manager?.id;
      const hotelKey = "68c016f89540bdb6226598f2";

      if (!hotelKey) {
        return res
          .status(400)
          .json({ success: false, message: "Manager ID not provided" });
      }

      const { password } = req?.body;

      if (!password) {
        return res
          .status(400)
          .json({ success: false, message: "Password is required" });
      }

      const response = await ManagerProfileSchema.findOne({ _id:hotelKey }).lean();

      if (!response) {
        return res
          .status(404)
          .json({ success: false, message: "Manager not found" });
      }

      // Compare provided password with hashed password
      const isMatch = await bcrypt.compare(password, response.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid password" });
      }

      // ================================
      // 4. Generate OTP and send email
      // ================================
      const { Otp, html } = mgr_DeleteAccountOtpUI(response?.email);

      // Store OTP in Redis with 3-minute expiry
      await redis.set(`Mgr_otp_delete_account:${response?.email}`, Otp, { ex: 180 });

      // Send OTP email to manager
      await sendEmail({
        toEmail: response?.email,
        subject: "DineQR Manager OTP",
        htmlContent: html,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent to your email. It is valid for 3 minutes.",
      });
    } catch (error) {
      console.error("Error in delete account request:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later.",
      });
    }
  }
);

export default mgr_Request_deleteAccount_Router;
