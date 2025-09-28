import { Router, Response } from "express";
import { ManagerRequest } from "../../../types/manager";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import StaffProfileSchema from "../../../models/manager/mgr_Staff_ProfileSchemaModel";
import { redis } from "../../../config/redis";

const mgr_Get_staff_account_Router = Router();

mgr_Get_staff_account_Router.get(
  "/api/v1/manager/get/staff/accounts",
  verifyToken("manager"),
  async (req: ManagerRequest, res: Response) => {
    try {
      // Use real manager ID from token if available
      const hotelKey = req.manager?.id;

      if (!hotelKey) {
        return res
          .status(400)
          .json({ success: false, message: "Manager ID not provided" });
      }

      const redisKey = `mgr_StaffAccount_list:${hotelKey}`;

      // 1️⃣ Check Redis cache first
      const cachedProfile = await redis.get(redisKey);
      if (cachedProfile) {
        return res.status(200).json({
          success: true,
          message: "Staff accounts fetched successfully",
          data: cachedProfile,
        });
      }

      // Fetch staff accounts for this manager's hotel
      const staffAccounts = await StaffProfileSchema.find({
        hotelKey,
        isDeleted: false,
      })
        .lean()
        .select("name staffId -_id");

      if (staffAccounts.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No staff accounts found",
        });
      }

      await redis.set(redisKey, JSON.stringify(staffAccounts), { ex: 3600 });

      return res.status(200).json({
        success: true,
        message: "Staff accounts fetched successfully",
        data: staffAccounts,
      });
    } catch (error) {
      console.error("Error fetching staff accounts:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export default mgr_Get_staff_account_Router;
