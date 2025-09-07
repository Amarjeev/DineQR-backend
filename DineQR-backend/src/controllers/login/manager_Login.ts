import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import manager_profileModel from "../../models/manager/manager_profile.model";

const loginManager = Router();

/**
 * Manager Login Route
 * --------------------
 * @route   POST /api/v1/auth/login/manager
 * @desc    Login a manager
 * @access  Public
 */
loginManager.post(
  "/api/v1/auth/login/manager",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // 1. Validate request
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "All fields are required",
        });
        return;
      }

      // 2. Check if manager exists
      const manager = await manager_profileModel
        .findOne({ email, deletedAt: null })
        .select("name email password") // select password for comparison
        .lean();

      if (!manager) {
        res.status(404).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // 3. Compare passwords
      const isMatch = await bcrypt.compare(password, manager.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // 4. Send success response (excluding password)
      res.status(200).json({
        success: true,
        message: "Login successful",
        manager: {
          id: manager._id,
          name: manager.name,
        },
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error, please try again later",
      });
    }
  }
);

export default loginManager;
