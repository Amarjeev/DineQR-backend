import { MultiUserRequest } from './../../../types/user';
import { Router, Response } from "express";
import tableSchema from "../../../models/manager/mgr_TableSchemaModel";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { redis } from "../../../config/redis";


const mgr_get_TableList_Router = Router();

mgr_get_TableList_Router.get(
  "/api/v1/manager/get/tableList",
  verifyToken("manager"),
  async (req: MultiUserRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.hotelKey;

      // ✅ Extract pagination from query params (default: page 1, limit: 20)
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      if (!hotelKey) {
        return res
          .status(400)
          .json({ message: "Manager ID (hotelKey) is missing" });
      }

      // ✅ Create a unique cache key for pagination
      const redisKey = `mgr_tableList_${hotelKey}_page${page}_limit${limit}`;

      // ✅ Check Redis cache
      const redisData = await redis.get(redisKey);
      if (redisData) {
        return res.status(200).json(redisData);
      }

      // ✅ Fetch data from MongoDB
      const result = await tableSchema.aggregate([
        { $match: { hotelKey } },
        {
          $project: {
            _id: 0,
            tableNames: {
              $slice: [
                {
                  $filter: {
                    input: "$tableNames",
                    as: "table",
                    cond: { $eq: ["$$table.isDeleted", false] },
                  },
                },
                skip,
                limit,
              ],
            },
            totalTables: {
              $size: {
                $filter: {
                  input: "$tableNames",
                  as: "table",
                  cond: { $eq: ["$$table.isDeleted", false] },
                },
              },
            },
          },
        },
      ]);

      if (!result || result.length === 0) {
        return res.status(404).json({ message: "No table data found" });
      }

      const responseData = {
        totalTables: result[0]?.totalTables ?? 0,
        tableNames: result[0]?.tableNames ?? [],
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil((result[0]?.totalTables ?? 0) / limit),
      };

      // ✅ Cache the paginated response for 10 minutes
      await redis.set(redisKey, JSON.stringify(responseData), { ex: 600 });

      return res.status(200).json(responseData);
    } catch (error) {
      console.error("❌ Error fetching table list:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch table list", error });
    }
  }
);

export default mgr_get_TableList_Router;
