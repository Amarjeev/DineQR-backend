// Import required modules
import { Router, Response } from "express";
import Table_Schema from "../../../models/manager/mgr_TableSchemaModel";
import { MultiUserRequest } from './../../../types/user';
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { redis } from "../../../config/redis";


// Create a new router instance
const mgr_delete_Table_Router = Router();

// Route: Delete table (soft delete by setting isDeleted=true)
mgr_delete_Table_Router.post(
  "/api/v1/manager/delete/table",
  verifyToken("manager"), // ✅ Middleware to verify manager token
  async (req: MultiUserRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.hotelKey;
      const { itemId, PageNumber } = req.body;

      // ✅ Validate request
      if (!hotelKey || !itemId) {
        return res.status(400).json({
          message: "hotelKey and itemId are required",
          success: false,
        });
      }

      // ✅ Check if hotel document exists
      const hotelTables = await Table_Schema.findOne({ hotelKey });
      if (!hotelTables) {
        return res
          .status(404)
          .json({ message: "Hotel not found", success: false });
      }

      // ✅ Soft delete: mark specific table as deleted
      await Table_Schema.updateOne(
        { hotelKey, "tableNames._id": itemId },
        { $set: { "tableNames.$.isDeleted": true } }
      );

      // ✅ Clear Redis cache for this hotel's table list
      for (let page = 1; page <= PageNumber; page++) {
        const redisKey = `mgr_tableList_${hotelKey}_page${page}_limit20`;
        await redis.del(redisKey);
      }

      return res.status(200).json({
        message: "Deleted successfully",
        success: true,
      });
    } catch (error) {
      console.error("❌ Error deleting table:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

export default mgr_delete_Table_Router;
