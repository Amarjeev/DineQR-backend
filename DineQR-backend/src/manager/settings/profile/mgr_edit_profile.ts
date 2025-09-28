import { Router, Response } from "express";
import { ManagerRequest } from "../../../types/manager";
import ManagerProfileSchema from "../../../models/manager/mgr_ProfileSchemaModel";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { mgr_Profile_Validation_Middleware } from "./validation/mgr_profileValidation";
import bcrypt from "bcryptjs";
import { redis } from "../../../config/redis";

const mgr_edit_ManagerProfile_Router = Router();

mgr_edit_ManagerProfile_Router.post(
  "/api/v1/manager/edit/profile",
  verifyToken("manager"),
  mgr_Profile_Validation_Middleware,
  async (req: ManagerRequest, res: Response) => {
    try {
      // Use real manager ID from token if available
      const hotelKey = req.manager?.id;

      if (!hotelKey) {
        return res.status(400).json({ message: "Manager ID not provided" });
      }

      const { name, email, mobileNumber, password } = req?.body?.formData;

      // Check if email already exists for another active manager
      const existingEmail = await ManagerProfileSchema.findOne({
        email,
        isDeleted: false, // only consider managers that are not deleted
        _id: { $ne: hotelKey }, // exclude the current manager
      }).lean();

      if (existingEmail) {
        return res.status(409).json({ message: "Email is already in use" });
      }

      // Build update object
      const updateData: Partial<typeof req.body> = {
        name,
        email,
        mobileNumber,
      };

      // Hash password only if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }

      // Update manager profile
      const updatedProfile = await ManagerProfileSchema.findByIdAndUpdate(
        hotelKey,
        { $set: updateData },
        { new: true, select: "_id" } // return updated fields
      ).lean();

      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const redisKey = `mgr_ManagerProfile:${hotelKey}`;
      await redis.del(redisKey);

      return res.status(200).json({
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating manager profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default mgr_edit_ManagerProfile_Router;
