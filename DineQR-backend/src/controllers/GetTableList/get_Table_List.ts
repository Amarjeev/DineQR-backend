import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import Table_Schema from "../../models/manager/mgr_TableSchemaModel";

const get_Table_List_Router = Router();

get_Table_List_Router.get(
  "/api/v1/:role/get/table-list",
  verifyToken(""), // Token verification for all roles
  async (req: MultiUserRequest, res: Response) => {
    try {
      const role = req.params.role ? req.params.role.toLowerCase().trim() : "";

      // Get hotelKey based on role from token payload
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      if (!hotelKey) {
        return res.status(404).json({
          success: false,
          message: "HotelKey not found for this role.",
        });
      }

      // Query table schema
      const response = await Table_Schema
        .findOne({ hotelKey })
        .lean()
        .select("tableNames.name tableNames.isDeleted");

      if (!response || !response.tableNames) {
        return res.status(404).json({
          success: false,
          message: "No tables found for this hotel.",
        });
      }

      // Filter only active (non-deleted) tables
      const activeTables = response.tableNames
        .filter((table: any) => table.isDeleted === false)
        .map((table: any) => ({
          name: table.name,
        }));

      return res.status(200).json({
        success: true,
        tables: activeTables,
      });
    } catch (error) {
      console.error("Error fetching tables:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

export default get_Table_List_Router;
