import { MultiUserRequest } from './../../../../types/user';
import { Router, Response } from "express";
import { verifyToken } from "../../../../middleware/verifyToken/verifyToken";
import Manager_Profile_Schema from "../../../../models/manager/mgr_ProfileSchemaModel";
import Staff_Profile_Schema from '../../../../models/manager/mgr_Staff_ProfileSchemaModel';

import { redis } from "../../../../config/redis";

const mgr_verify_otp_staff_delAc_Router = Router();

// ==============================
// Route: Verify OTP & Delete Staff Account
// ==============================
mgr_verify_otp_staff_delAc_Router.post(
  "/api/v1/manager/OtpVerify/delete/staff-account",
  verifyToken("manager"), // Ensure the requester is a verified manager
  async (req: MultiUserRequest, res: Response) => {
    try {
      // ==============================
      // Extract OTP and staffId from request body
      // ==============================
      const { otp, staffId } = req?.body?.formData;
      const hotelKey = req.manager?.hotelKey; // Manager ID from verified token

      // ==============================
      // Validate required fields
      // ==============================
      if (!otp || !staffId) {
        res.status(400).json({ error: "OTP and Staff ID are required" });
        return;
      }

      if (!hotelKey) {
        res
          .status(400)
          .json({ success: false, message: "Manager ID not provided" });
        return;
      }

      // ==============================
      // Fetch manager from DB and ensure not deleted
      // ==============================
      const manager = await Manager_Profile_Schema.findOne({
        _id: hotelKey,
        isDeleted: false,
      });

      if (!manager) {
        res.status(404).json({ success: false, message: "Manager not found" });
        return;
      }

      // ==============================
      // Get saved OTP from Redis
      // Redis is used to temporarily store OTPs for verification.
      // Key is unique per manager email + staffId.
      // ==============================
      const savedOtp = await redis.get(
        `Mgr_otp_delete_Staffaccount:${manager?.email}:${staffId}`
      );

      if (!savedOtp) {
        res
          .status(401)
          .json({ success: false, message: "OTP expired or not found" });
        return;
      }

      // ==============================
      // Compare provided OTP with saved OTP
      // ==============================
      if (Number(otp) !== Number(savedOtp)) {
        res.status(401).json({ success: false, message: "Invalid OTP" });
        return;
      }

      // ==============================
      // Mark the staff account as deleted
      // ==============================
      await Staff_Profile_Schema.findOneAndUpdate(
        {
          hotelKey,
          staffId,
          isDeleted: false,
        },
        {
          $set: { isDeleted: true },
        }
      );

      // ==============================
      // Clean up Redis keys
      // - Delete OTP after successful verification
      // - Delete cached staff list to refresh future queries
      // ==============================
      await redis.del(
        `Mgr_otp_delete_Staffaccount:${manager?.email}:${staffId}`
      );

      const redisKey = `mgr_StaffAccount_list:${hotelKey}`;
      await redis.del(redisKey);

      // ==============================
      // Respond with success
      // ==============================
      res.status(200).json({
        success: true,
        message: "Account deletion confirmed. OTP verified successfully.",
      });
      return;

    } catch (error) {
      // ==============================
      // Handle unexpected server errors
      // ==============================
      console.error("Error verifying OTP for account deletion:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later.",
      });
    }
  }
);

export default mgr_verify_otp_staff_delAc_Router;
