import { Router, Response } from "express";
import billSchema from "../../../models/manager/mgr_BillSchemaModel";
import { ManagerRequest } from "../../../types/manager";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { validateBillData } from "../ValidationBill/validationBill";

const mgr_Create_Bill_Router = Router();

mgr_Create_Bill_Router.post(
  "/api/v1/manager/create/bill",
  verifyToken("manager"),
  validateBillData,
  async (req: ManagerRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.id;
      if (!hotelKey) {
        return res
          .status(400)
          .json({ success: false, error: "Hotel key missing" });
      }

      const { restaurantName, address, gstNumber, contactNumber } = req.body;

      // Check if GST already exists for this hotel
      const existingBill = await billSchema.findOne({
        hotelKey,
        deleted: false,
      });
      if (existingBill) {
        return res.status(409).json({
          success: false,
          error:
            "Each hotel/manager can only have one active bill. Please delete the existing bill first.",
        });
      }

      // Create new bill
      await billSchema.create({
        hotelKey,
        restaurantName,
        address,
        gstNumber,
        contactNumber,
      });

      return res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, error: "Something went wrong" });
    }
  }
);

export default mgr_Create_Bill_Router;
