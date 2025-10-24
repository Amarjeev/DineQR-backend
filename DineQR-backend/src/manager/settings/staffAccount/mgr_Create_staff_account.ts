import { MultiUserRequest } from './../../../types/user';
import { Router, Response } from "express";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import bcrypt from "bcryptjs";
import Staff_Profile_Schema from '../../../models/manager/mgr_Staff_ProfileSchemaModel';
import { mgr_Staff_profileValidation } from "./validation/mgr_Staff_profileValidation";


const mgr_Create_staff_account_Router = Router();

mgr_Create_staff_account_Router.post(
  "/api/v1/manager/create/staff/account",
  verifyToken("manager"),
  mgr_Staff_profileValidation,
  async (req: MultiUserRequest, res: Response) => {
    try {
      const { staffId, password, name } = req?.body?.formData;

      // Use real manager ID from token if available
      const hotelKey = req.manager?.hotelKey;

      if (!hotelKey) {
        res
          .status(400)
          .json({ success: false, message: "Manager ID not provided" });
        return;
      }

      // Check if staff ID already exists
      const existestaff = await Staff_Profile_Schema.findOne({
        staffId,
        hotelKey,
        isDeleted:false
      });
      if (existestaff) {
        res
          .status(409)
          .json({ success: false, message: "Staff ID already exists" });
        return;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

      // Create new staff
      const staffData = new Staff_Profile_Schema({
        hotelKey,
        staffId,
        name,
        password: hashedPassword,
      });

      await staffData.save();

      res
        .status(201)
        .json({ success: true, message: "Staff account created successfully" });
      return;
    } catch (error) {
      console.error("Error creating staff account:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

export default mgr_Create_staff_account_Router;
