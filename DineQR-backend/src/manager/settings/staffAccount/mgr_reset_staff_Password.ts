import { Router, Response } from "express";
import { ManagerRequest } from "../../../types/manager";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import bcrypt from "bcryptjs";
import StaffProfileSchema from "../../../models/manager/mgr_Staff_ProfileSchemaModel";
import { mgr_Staff_profileValidation } from "./validation/mgr_Staff_profileValidation";
import { redis } from "../../../config/redis";

const mgr_reset_staff_password_Router = Router();

mgr_reset_staff_password_Router.post(
  "/api/v1/manager/reset-staff-password",
  verifyToken("manager"),
  mgr_Staff_profileValidation,
  async (req: ManagerRequest, res: Response) => {
    try {
      const { staffId, password, name, skipPassword } = req?.body?.formData;

      const hotelKey = req.manager?.id;

      const redisKey = `mgr_StaffAccount_list:${hotelKey}`;

      if (!hotelKey) {
        res
          .status(400)
          .json({ success: false, message: "Manager ID not provided" });
        return;
      }

      // Find staff by ID and ensure they belong to this manager
      const staff = await StaffProfileSchema.findOne({ staffId, hotelKey });
      if (!staff) {
        res.status(404).json({
          success: false,
          message: "Invalid staff ID or staff not found",
        });
        return;
      }

      // Always update name (optional: you can also update other fields)
      if (name) {
        staff.name = name;
      }

      // Update password only if skipPassword is false
      if (!skipPassword && password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        staff.password = hashedPassword;
      }

      await staff.save();

        await redis.del(redisKey);

      res.status(200).json({
        success: true,
        message: skipPassword
          ? "Staff profile updated successfully"
          : "Staff password reset successfully",
      });
      return;
    } catch (error) {
      console.error("Error updating staff profile:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return;
    }
  }
);

export default mgr_reset_staff_password_Router;
