import { MultiUserRequest } from './../../../types/user';
import { Router, Response } from "express";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import HotelInfoSchema from "../../../models/manager/mgr_HotelInfoSchemaModel";
import { redis } from "../../../config/redis";


const mgr_get_Hotelinfo_Router = Router();

mgr_get_Hotelinfo_Router.get(
  "/api/v1/manager/get/Hotelinfo",
  verifyToken("manager"),
  async (req: MultiUserRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.hotelKey;

      if (!hotelKey) {
        res
          .status(400)
          .json({ success: false, message: "Manager ID not provided" });
        return;
      }

      const redisKey = `mgr_HotelInfo:${hotelKey}`;

      // 1️⃣ Check Redis cache first
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        res.status(200).json({
          success: true,
          data: cachedData,
        });
        return;
      }

      // Find hotel info by hotelKey
      const hotelInfo = await HotelInfoSchema.findOne({ hotelKey })
        .lean()
        .select("-createdAt -updatedAt -hotelKey -_id");

      // 3️⃣ Store in Redis for future requests (expire in 1 hour)
      await redis.set(redisKey, JSON.stringify(hotelInfo), { ex: 3600 });

      // ✅ If not found, return null instead of error
      res.status(200).json({
        success: true,
        data: hotelInfo || null, // frontend can handle creating new record
      });
      return;
    } catch (error) {
      console.error("Error fetching hotel info:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching hotel info",
      });
      return;
    }
  }
);

export default mgr_get_Hotelinfo_Router;
