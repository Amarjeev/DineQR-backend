import { MultiUserRequest } from './../../../types/user';
import { Router, Response } from "express";
import billSchema from "../../../models/manager/mgr_BillSchemaModel";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { redis } from "../../../config/redis";
import { diff } from "deep-diff";


const mgr_Edit_Bill_Router = Router();

mgr_Edit_Bill_Router.patch(
  "/api/v1/manager/edit/bill",
  verifyToken("manager"),
  async (req: MultiUserRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.hotelKey;
      const formData = req.body;
      const redisKey = `bill:${hotelKey}`;

      // 1️⃣ Check Redis cache first
      const originalBill = await redis.get(redisKey);
      if (!originalBill) {
        res.status(404).json({
          success: false,
          message: "Original bill not found in cache",
        });
        return;
      }

      // 2️⃣ Compare objects
      const differences = diff(originalBill, formData);

      // 3️⃣ Extract changed top-level keys
      const changedKeys = differences
        ? differences.map((d) => d.path?.[0])
        : [];

      // 4️⃣ Build update object dynamically
      const updateData: Record<string, any> = {};
      for (const key of changedKeys) {
        updateData[key] = formData[key];
      }

      // Only proceed if there are fields to update
      if (Object.keys(updateData).length > 0) {
        // 5️⃣ Update only changed fields in MongoDB
        await billSchema.findOneAndUpdate(
          { hotelKey },
          { $set: updateData },
          { new: true } // return updated doc
        );
        await redis.del(redisKey);
      }

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error("Error editing bill:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export default mgr_Edit_Bill_Router;
