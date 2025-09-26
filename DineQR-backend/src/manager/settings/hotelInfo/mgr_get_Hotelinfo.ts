import { Router, Response } from "express";
import { ManagerRequest } from "../../../types/manager";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import HotelInfoSchema from "../../../models/manager/mgr_HotelInfoSchemaModel";

const mgr_get_Hotelinfo_Router = Router();

mgr_get_Hotelinfo_Router.post(
  "/api/v1/manager/get/Hotelinfo",
  verifyToken("manager"),
  async (req: ManagerRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.id;

      if (!hotelKey) {
        res
          .status(400)
          .json({ success: false, message: "Manager ID not provided" });
        return;
      }

      // Find hotel info by hotelKey
      const hotelInfo = await HotelInfoSchema.findOne({ hotelKey }).lean().select('-createdAt -updatedAt');

      // ✅ If not found, return null instead of error
      res.status(200).json({
        success: true,
        data: hotelInfo || null, // frontend can handle creating new record
      });
      return;
    } catch (error) {
      console.error("Error fetching hotel info:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching hotel info",
      });
      return;
    }
  }
);

export default mgr_get_Hotelinfo_Router;
