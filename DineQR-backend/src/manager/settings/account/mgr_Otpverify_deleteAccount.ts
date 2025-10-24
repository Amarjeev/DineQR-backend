import { MultiUserRequest } from './../../../types/user';
import { Router, Response } from "express";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import Manager_Profile_Schema from '../../../models/manager/mgr_ProfileSchemaModel';
import { redis } from "../../../config/redis";

const mgr_Otpverify_deleteAccount_Router = Router();

mgr_Otpverify_deleteAccount_Router.post(
  "/api/v1/manager/OtpVerify/delete/account",
  verifyToken("manager"),
  async (req: MultiUserRequest, res: Response) => {
    try {
      const { otp } = req.body;

      const hotelKey = req.manager?.hotelKey;

      if (!hotelKey) {
        res
          .status(400)
          .json({ success: false, message: "Manager ID not provided" });
        return;
      }

      const manager = await Manager_Profile_Schema.findById(hotelKey);

      if (!manager) {
        res.status(404).json({ success: false, message: "Manager not found" });
        return;
      }

      // Get saved OTP from Redis
      const savedOtp = await redis.get(
        `Mgr_otp_delete_account:${manager.email}`
      );

      if (!savedOtp) {
        res
          .status(401)
          .json({ success: false, message: "OTP expired or not found" });
        return;
      }

      if (Number(otp) !== Number(savedOtp)) {
        res.status(401).json({ success: false, message: "Invalid OTP" });
        return;
      }

      // Mark account as deleted
      manager.isDeleted = true;
      await manager.save();

      // Clear authentication cookie
      res.clearCookie("manager_Token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      // Optionally, delete the OTP from Redis after successful verification
      await redis.del(`Mgr_otp_delete_account:${manager.email}`);

      res.status(200).json({
        success: true,
        message: "Account deletion confirmed. OTP verified successfully.",
      });
      return;
    } catch (error) {
      console.error("Error verifying OTP for account deletion:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later.",
      });
    }
  }
);

export default mgr_Otpverify_deleteAccount_Router;
