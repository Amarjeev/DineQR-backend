import { Router, Response } from "express";
import billSchema from "../../../models/manager/mgr_BillSchemaModel";
import { ManagerRequest } from "../../../types/manager";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { redis } from "../../../config/redis";

const mgr_Get_Bill_Router = Router();

mgr_Get_Bill_Router.get(
  "/api/v1/manager/create/bill",
  verifyToken("manager"),
  async (req: ManagerRequest, res: Response) => {
    const hotelKey = req.manager?.id;

    if (!hotelKey) {
      return res
        .status(400)
        .json({ success: false, error: "Hotel key missing" });
    }

    try {
      const redisKey = `bill:${hotelKey}`;

      // 1️⃣ Check Redis cache first
      const cachedBill = await redis.get(redisKey);
      if (cachedBill) {
        return res.status(200).json({
          success: true,
          bill: cachedBill,
        });
      }

      // 2️⃣ If not cached, fetch from MongoDB
      const existingBill = await billSchema
        .findOne({
          hotelKey,
          deleted: false,
        })
        .select("restaurantName address gstNumber contactNumber -_id")
        .lean();

      if (!existingBill) {
        return res
          .status(404)
          .json({ success: false, error: "No bill found for this hotel" });
      }

      // 3️⃣  Save in Redis (cache for 30 minutes = 1800s)
      await redis.set(redisKey, JSON.stringify(existingBill), { ex: 1800 });

      return res.status(200).json({ success: true, bill: existingBill });
    } catch (error: any) {
      console.error("Error fetching bill:", error);
      return res.status(500).json({
        success: false,
        error: "Something went wrong, please try again",
      });
    }
  }
);

export default mgr_Get_Bill_Router;
