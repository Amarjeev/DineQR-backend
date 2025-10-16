// ============================================================
// 📦 IMPORTS
// ============================================================
import { Router, Response } from "express";
import { MultiUserRequest } from "../../types/user";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";

// ============================================================
// 🛠️ INITIALIZE ROUTER
// ============================================================
const get_Order_History_Router = Router();

// ============================================================
// 📡 GET: /api/v1/:role/get/orders-history
// ============================================================
get_Order_History_Router.get(
  "/api/v1/:role/get/orders-history",
  verifyToken(""), // 🔒 Add role-based token verification
  async (req: MultiUserRequest, res: Response) => {
    try {
      // ✅ Use req.query since frontend sends GET with params
      const reqQuery = req.query;
      const mappedObject: any = {};

      // ============================================================
      // 🔍 SEARCH TERM HANDLING
      // ============================================================
      if (reqQuery.searchTerm) {
        const search = String(reqQuery.searchTerm).trim();
        if (search.startsWith("ORD-")) {
          mappedObject.orderId = search.toUpperCase();
        } else {
          mappedObject.mobileNumber = search;
        }
      }

      // ============================================================
      // 📅 DATE FILTERING
      // ============================================================
      if (reqQuery.date) {
        const start = new Date(String(reqQuery.date));
        start.setHours(0, 0, 0, 0);

        const end = new Date(String(reqQuery.date));
        end.setHours(23, 59, 59, 999);

        mappedObject.createdAt = { $gte: start, $lte: end };
      }

      // ============================================================
      // 🍽️ TABLE & ORDER TYPE FILTERING
      // ============================================================
      if (reqQuery.table)
        mappedObject.tableNumber = String(reqQuery.table).trim();
      if (reqQuery.orderType)
        mappedObject.orderType = String(reqQuery.orderType).trim();

      // ============================================================
      // 📦 STATUS FILTERING
      // ============================================================
      switch (reqQuery.status) {
        case "delivered":
          mappedObject.orderDelivered = true;
          break;
        case "pending":
          mappedObject.orderAccepted = true;
          break;
        case "unpaid":
          mappedObject.paymentStatus = false;
          break;
        case "paid":
          mappedObject.paymentStatus = true;
          break;
        case "cancelled":
          mappedObject.orderCancelled = true;
          mappedObject.kitchOrderCancelation = true;
          break;
      }

      // ============================================================
      // 🏨 ROLE VALIDATION
      // ============================================================
      const role = req.params.role?.toLowerCase().trim() || "";

      if (!["manager", "staff", "guest"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles: manager, staff, guest.",
        });
      }

      // Extract hotel key
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      if (!hotelKey) {
        return res.status(400).json({
          success: false,
          error: "Hotel key or userId missing",
        });
      }

      mappedObject.hotelKey = hotelKey;

      // ============================================================
      // 🔢 PAGINATION PARAMETERS
      // ============================================================
      const page = parseInt(String(reqQuery.page || "1"), 10);
      const limit = parseInt(String(reqQuery.limit || "20"), 10);
      const skip = (page - 1) * limit;

      // ============================================================
      // 🧩 EXECUTE QUERY WITH PAGINATION
      // ============================================================
      let totalCount;
      if (Number(page) === 1) {
        totalCount = await OrderSchemaModel.countDocuments(mappedObject);
      }

      const response = await OrderSchemaModel.find(mappedObject)
        .skip(skip)
        .limit(limit)
        .lean()
        .select("-updatedAt -__v");

      // ============================================================
      // ✅ SUCCESS RESPONSE
      // ============================================================
      return res.status(200).json({
        success: true,
        message: "Order history fetched successfully",
        data: response,
        totalCount,
      });
    } catch (error) {
      console.error("Error fetching order history:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while fetching order history",
      });
    }
  }
);

// ============================================================
// 🚀 EXPORT ROUTER
// ============================================================
export default get_Order_History_Router;
