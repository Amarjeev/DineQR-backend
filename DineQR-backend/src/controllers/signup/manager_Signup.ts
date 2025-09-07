import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import manager_profileModel from "../../models/manager/manager_profile.model";

// Create a new Router instance
const signupManager = Router();

/**
 * Manager Signup Route
 * --------------------
 * @route   POST /api/v1/auth/signup/manager
 * @desc    Register a new manager
 * @access  Public
 */
signupManager.post(
  "/api/v1/auth/signup/manager",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, MobileNumber, password } = req.body;

      // 1. Validate request
      if (!name || !email || !MobileNumber || !password) {
          res.status(400).json({ message: "All fields are required" });
          return
      }

      // 2. Check if user already exists
      const existingManager = await manager_profileModel.findOne({ email ,deletedAt:null});
      if (existingManager) {
          res.status(409).json({ message: "Manager already exists" });
        return
      }

      // 3. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Create new manager
      const newManager = new manager_profileModel({
        name,
        email,
        MobileNumber,
        password: hashedPassword,
      });

      await newManager.save();

      // 5. Send response
      res
        .status(201)
        .json({ message: "Manager registered successfully"});
    } catch (error) {
      console.error("❌ Signup error:", error);
      res.status(500).json({ message: "Server error, please try again later" });
    }
  }
);

export default signupManager;
