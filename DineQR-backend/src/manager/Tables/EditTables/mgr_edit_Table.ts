import { Router, Response } from "express";
import tableSchema from "../../../models/manager/mgr_TableSchemaModel";
import { ManagerRequest } from "../../../types/manager";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { redis } from "../../../config/redis";

const mgr_edit_Table_Router = Router();

mgr_edit_Table_Router.patch(
  "/api/v1/manager/edit/table",
  verifyToken("manager"),
  async (req: ManagerRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.id;
      const { tableName: rawTableName, editItemId, PageNumber } = req.body;
      const tableName = rawTableName?.toUpperCase();

      // Validation
      if (!tableName || !hotelKey || !editItemId) {
        return res.status(400).json({
          message: "tableName, hotelKey, and editItemId are required",
          success: false,
        });
      }

      // Allow only letters and digits
      const validNameRegex = /^[A-Za-z0-9]+$/;
      if (!validNameRegex.test(tableName)) {
        return res.status(400).json({
          message: "Invalid input. Only letters and digits are allowed.",
          success: false,
        });
      }

      // ✅ Check if hotel document exists
      const hotelTables = await tableSchema.findOne({ hotelKey });

      if (!hotelTables) {
        return res
          .status(404)
          .json({ message: "Hotel not found", success: false });
      }

      // ✅ Prevent duplicate names (case-insensitive)
      if (
        hotelTables.tableNames.some(
          (t) =>
            t.name.toUpperCase() === tableName &&
            t._id?.toString() !== editItemId && // ignore current table
            t.isDeleted !== true
        )
      ) {
        return res
          .status(409)
          .json({ message: "Table name already exists", success: false });
      }

      // ✅ Update the specific table inside the array
      await tableSchema.updateOne(
        { hotelKey, "tableNames._id": editItemId },
        {
          $set: {
            "tableNames.$.name": tableName, // update only the name field
          },
        }
      );

     
      for (let page = 1; page <= PageNumber; page++) {
        const redisKey = `mgr_tableList_${hotelKey}_page${page}_limit20`;
        await redis.del(redisKey);
      }

      return res.status(200).json({
        message: "Table updated successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error updating table:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  }
);

export default mgr_edit_Table_Router;
