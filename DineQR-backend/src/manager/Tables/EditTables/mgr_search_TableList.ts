import { MultiUserRequest } from './../../../types/user';
import { Router, Response } from "express";
import tableSchema from "../../../models/manager/mgr_TableSchemaModel";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";


const mgr_search_TableList_Router = Router();

mgr_search_TableList_Router.get(
  "/api/v1/manager/search/tableList",
  verifyToken("manager"),
  async (req: MultiUserRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.hotelKey;

      // Access tableName from query params and convert to uppercase
      const rawTableName = req.query.tableName as string;
      const tableName = rawTableName?.toUpperCase() || "";

      // Validate presence
      if (!tableName || !hotelKey) {
        res
          .status(400)
          .json({ message: "tableName and hotelKey required", success: false });
        return;
      }

      // Allow only letters and digits
      const validNameRegex = /^[A-Za-z0-9]+$/;
      if (!validNameRegex.test(tableName)) {
        res.status(400).json({ error: "Invalid table name format" });
        return;
      }

      const result = await tableSchema.findOne(
        {
          hotelKey,
          tableNames: {
            $elemMatch: {
              name: { $regex: "^" + tableName, $options: "i" }, // starts-with, case-insensitive
              isDeleted: false, // only not deleted tables
            },
          },
        },
        { "tableNames.$": 1 } // projection to return only the matched table
      );

      // If no table found, return 404
      if (!result || !result.tableNames || result.tableNames.length === 0) {
        res.status(404).json({ error: "Table not found", success: false });
        return;
      }

      res.send(result?.tableNames[0]);
      return;

      // your aggregation logic here
    } catch (error) {
      res.status(500).json({ message: "Server error", success: false });
      return;
    }
  }
);

export default mgr_search_TableList_Router;
