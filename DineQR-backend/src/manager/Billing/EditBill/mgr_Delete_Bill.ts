import { Router, Response } from "express";
import billSchema from "../../../models/manager/mgr_BillSchemaModel";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { redis } from "../../../config/redis";
import { MultiUserRequest } from "../../../types/user";

const mgr_Delete_Bill_Router = Router();

mgr_Delete_Bill_Router.post(
  "/api/v1/manager/delete/bill",
  verifyToken("manager"),
  async (req: MultiUserRequest, res: Response) => {
    const hotelKey = req.manager?.hotelKey;
    const redisKey = `bill:${hotelKey}`;

    try {
      // 1️⃣ Mark bill as deleted in MongoDB
      const response = await billSchema.findOneAndUpdate(
        { hotelKey },
        { $set: { deleted: true } },
      );

      if (!response) {
        res.status(404).json({ success: false, message: "Bill not found" });
        return;
      }

      // 2️⃣ Remove the cached bill from Redis
      await redis.del(redisKey);

      // 3️⃣ Return success response
      res
        .status(200)
        .json({ success: true, message: "Bill deleted successfully" });
    } catch (error) {
      console.error("Error deleting bill:", error);
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
);

export default mgr_Delete_Bill_Router;
