import { Router, Response } from "express";
import { ManagerRequest } from "../../../types/manager";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import HotelInfoSchema from "../../../models/manager/mgr_HotelInfoSchemaModel";
import { mgr_HotelInfo_Validation_Middleware } from "./validation/mgr_HotelInfoValidation";

const mgr_upload_Hotelinfo_Router = Router();

mgr_upload_Hotelinfo_Router.post(
  "/api/v1/manager/upload/Hotelinfo",
  verifyToken("manager"),
  mgr_HotelInfo_Validation_Middleware,
  async (req: ManagerRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.id;

      if (!hotelKey) {
        return res
          .status(400)
          .json({ success: false, message: "Manager ID not provided" });
      }

      const hotelData = { ...req.body, hotelKey };

      // ✅ Check if record already exists
      const existing = await HotelInfoSchema.findOne({ hotelKey });

      if (existing) {
        // Update fields
        existing.set(hotelData);
        await existing.save();

        return res.status(200).json({
          success: true,
          message: "Hotel info updated successfully",
        });
      }

      // ✅ Otherwise create new record
      const newHotelInfo = new HotelInfoSchema(hotelData);
      await newHotelInfo.save();

      return res.status(201).json({
        success: true,
        message: "Hotel info uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading hotel info:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while uploading hotel info",
      });
    }
  }
);

export default mgr_upload_Hotelinfo_Router;
