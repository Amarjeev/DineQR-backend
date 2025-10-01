/**
 * Manager Create Table Route
 * ----------------------------------------
 * Endpoint: POST /api/v1/manager/create/table
 * Purpose:  Allows a manager to create and manage tables for their hotel.
 *
 * Features:
 *  - Validates that `tableName` and `hotelKey` exist
 *  - Prevents duplicate table names (returns 409 Conflict)
 *  - Stores all table names for a hotel in an array of objects with `isDeleted`
 *  - Inserts new tables at the beginning of the array
 *  - Creates a new hotel record if one doesn’t exist
 *  - Returns structured JSON responses with success/error status
 *
 * Response Codes:
 *  - 400 → Missing `tableName` or `hotelKey` or invalid format
 *  - 409 → Duplicate table name
 *  - 201 → Table created successfully
 *  - 500 → Internal server error
 */

import { Router, Response } from "express";
import tableSchema from "../../../models/manager/mgr_TableSchemaModel";
import { MultiUserRequest } from './../../../types/user';
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { redis } from "../../../config/redis";


const mgr_Create_Table_Router = Router();

mgr_Create_Table_Router.post(
  "/api/v1/manager/create/table",
  verifyToken("manager"),
  async (req: MultiUserRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.hotelKey;

      // Destructure and immediately convert to uppercase
      const { tableName: rawTableName } = req.body;
      const tableName = rawTableName.toUpperCase();
      // Validate presence
      if (!tableName || !hotelKey) {
        return res
          .status(400)
          .json({ message: "tableName and hotelKey required", success: false });
      }

      // Allow only letters and digits
      const validNameRegex = /^[A-Za-z0-9]+$/;
      if (!validNameRegex.test(tableName)) {
        return res.status(400).json({
          message: "Invalid input. Only letters and digits are allowed.",
          success: false,
        });
      }

      // Check if hotel document exists
      let hotelTables = await tableSchema.findOne({ hotelKey });

      if (hotelTables) {
        // Check if table already exists (case-insensitive)
        if (
          hotelTables.tableNames.some(
            (t) => t.name === tableName && t.isDeleted !== true
          )
        ) {
          return res
            .status(409)
            .json({ message: "Table name already exists", success: false });
        }

        // Insert new table at the beginning
        hotelTables.tableNames.unshift({
          name: tableName,
          isDeleted: false,
        });

        await hotelTables.save();
      } else {
        // Create new hotel document with first table
        hotelTables = new tableSchema({
          hotelKey,
          tableNames: [{ name: tableName, isDeleted: false }],
        });

        await hotelTables.save();
      }

      // ✅ Clear Redis cache for this hotel's table list
      await redis.del(`mgr_tableList${hotelKey}`);

      return res.status(201).json({
        message: "Table added successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error creating table:", error); // only log on server side

      return res.status(500).json({
        message: "Something went wrong while creating table",
        success: false,
      });
    }
  }
);

export default mgr_Create_Table_Router;
