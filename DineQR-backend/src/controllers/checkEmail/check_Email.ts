import { Router, Request, Response } from "express";
import { redis } from "../../config/redis";
import mgr_ProfileSchemaModel from "../../models/manager/mgr_ProfileSchemaModel";

const emailCheckRouter = Router();

/**
 * Check Email Route
 * -----------------
 * @route   POST /api/v1/check-email
 * @desc    Check if a given email already exists in the DB
 * @access  Public
 */
emailCheckRouter.post(
  "/api/v1/check-email",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      // ================================
      // Validate email presence
      // ================================
      if (!email) {
        res.status(400).json({ success: false, message: "Email is required" });
        return;
      }

      // ================================
      // Query database to check email existence
      // ================================
      const existingManager = await mgr_ProfileSchemaModel
        .findOne({ email, isDeleted: false }) // Only check non-deleted accounts
        .select("email password")
        .lean();

      if (existingManager) {
        await redis.set(email, JSON.stringify(existingManager), { ex: 600 }); //data collect in login router
        // Email exists
        res.status(200).json({
          exists: true,
          message: "Email already exists",
        });
      } else {
        // Email does not exist
        res.status(200).json({
          exists: false,
          message: "Email does not exist",
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Error checking email:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export default emailCheckRouter;
