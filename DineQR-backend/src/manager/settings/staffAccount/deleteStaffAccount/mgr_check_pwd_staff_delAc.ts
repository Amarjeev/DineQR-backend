import { MultiUserRequest } from './../../../../types/user';
import { Router, Response } from "express";
import { verifyToken } from "../../../../middleware/verifyToken/verifyToken";
import ManagerProfileSchema from "../../../../models/manager/mgr_ProfileSchemaModel";
import StaffProfileSchema from "../../../../models/manager/mgr_Staff_ProfileSchemaModel";
import bcrypt from "bcryptjs";
import { redis } from "../../../../config/redis";
import { sendEmail } from "../../../../services/sendEmail";
import mgr_DeleteStaffAccountOtpUI from "../../../../emailTemplates/mgr_DeleteStaffAccountOtpUI";


const mgr_check_pwd_staff_delAc_Router = Router();

/**
 * @route   POST /api/v1/manager/check-password/delete/staff-account
 * @desc    Verify manager password, generate OTP, and send email to confirm staff account deletion
 * @access  Manager
 */
mgr_check_pwd_staff_delAc_Router.post(
  "/api/v1/manager/check-password/delete/staff-account",
  verifyToken("manager"),
  async (req: MultiUserRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.hotelKey;

      // Check if manager ID exists
      if (!hotelKey) {
        return res
          .status(400)
          .json({ success: false, message: "Manager ID not provided" });
      }

      const { password, staffId } = req?.body?.formData;

      if (!password || !staffId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid request. Staff ID and password are required.",
          });
      }

      // ===============================
      // 1️⃣ Fetch staff data from DB
      // ===============================
      // Fetch staff and manager data in parallel using Promises
      const [staffData, managerData] = await Promise.all([
        StaffProfileSchema.findOne({ staffId, hotelKey })
          .lean()
          .select("password name staffId") as Promise<{
          password: string;
          name: string;
          staffId: string;
        } | null>,

        ManagerProfileSchema.findById(hotelKey)
          .lean()
          .select("email") as Promise<{ email: string } | null>,
      ]);

      if (!staffData) {
        return res
          .status(404)
          .json({ success: false, message: "Staff not found" });
      }

      // ===============================
      // 2️⃣ Verify manager password
      // ===============================
      const isMatch = await bcrypt.compare(password, staffData.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid password" });
      }

      // ===============================
      // 3️⃣ Generate OTP for staff account deletion
      // ===============================
      const { Otp, html } = mgr_DeleteStaffAccountOtpUI(
        managerData?.email || ""
      );

      // Store OTP in Redis (3-minute expiry)
      await redis.set(
        `Mgr_otp_delete_Staffaccount:${managerData?.email}:${staffId}`,
        Otp,
        {
          ex: 180, // seconds
        }
      );

      // ===============================
      // 4️⃣ Send OTP email to manager
      // ===============================
      await sendEmail({
        toEmail: managerData?.email || "",
        subject: "DineQR Manager OTP for Staff Deletion",
        htmlContent: html,
      });

      // ===============================
      // 5️⃣ Respond success
      // ===============================
      res.status(200).json({
        success: true,
        message: `OTP sent to your email`,
      });
      return;
    } catch (error) {
      console.error("Error in delete account request:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later.",
      });
    }
  }
);

export default mgr_check_pwd_staff_delAc_Router;
