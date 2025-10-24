import { MultiUserRequest } from './../../../types/user';
import { Router, Response } from "express";
import Manager_Profile_Schema from "../../../models/manager/mgr_ProfileSchemaModel";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { redis } from "../../../config/redis";


const mgr_get_ManagerProfile_Router = Router();

mgr_get_ManagerProfile_Router.get(
  "/api/v1/manager/get/profile",
  verifyToken('manager'),
  async (req: MultiUserRequest, res: Response) => {
    try {
        const hotelKey = req.manager?.hotelKey;

      if (!hotelKey) {
        return res.status(400).json({ message: "Manager ID not provided" });
      }

      const redisKey = `mgr_ManagerProfile:${hotelKey}`;

      // 1️⃣ Check Redis cache first
      const cachedProfile = await redis.get(redisKey);
      if (cachedProfile) {
        return res.status(200).json(cachedProfile);
      }

      const response = await Manager_Profile_Schema.findById(hotelKey)
        .lean()
        .select("name email mobileNumber -_id");

      if (!response) {
        return res.status(404).json({ message: "Profile not found" });
      }
      // 3️⃣ Store in Redis for future requests (expire in 1 hour)
      await redis.set(redisKey, JSON.stringify(response), { ex: 3600 });

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching manager profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default mgr_get_ManagerProfile_Router;
