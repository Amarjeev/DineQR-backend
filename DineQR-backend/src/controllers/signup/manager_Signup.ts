import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import mgr_ProfileSchemaModel from "../../models/manager/mgr_ProfileSchemaModel";
import { mgr_SignupValidation_Schema } from "./SignupValidation/mgr_SignupValidation";

// ================================
// Router Initialization
// ================================
// Create a new Router instance for handling manager signup routes
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
      // ================================
      // Validate incoming request using Zod schema
      // ================================
      const result = mgr_SignupValidation_Schema.safeParse(req.body);
      if (!result.success) {
        // If validation fails, return 400 with error message
        res.status(400).json({
          message: "Some fields are invalid. Please check your input.",
        });
        return;
      }

      // Destructure required fields from request body
      const { name, email, mobileNumber, password } = req.body;

      // ================================
      // Check for missing required fields
      // ================================
      if (!name || !email || !mobileNumber || !password) {
        res.status(400).json({
          success: false,
          message: "All fields are required",
        });
        return;
      }

      // ================================
      // Check if manager with this email already exists
      // ================================
      const existingManager = await mgr_ProfileSchemaModel
        .findOne({ email, isDeleted: false }) // Only check active managers
        .select("email") // Only select email to reduce DB load
        .lean(); // Convert to plain JS object for faster read

      if (existingManager) {
        // If email already exists, return conflict response
        res.status(409).json({
          success: false,
          message: "Email already exists",
        });
        return;
      }

      // ================================
      // Hash the password before saving
      // ================================
      const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

      // ================================
      // Create and save new manager document
      // ================================
      const newManager = new mgr_ProfileSchemaModel({
        name,
        email,
        mobileNumber,
        password: hashedPassword, // Store hashed password
      });

      await newManager.save();

      // ================================
      // Send success response
      // ================================
      res.status(201).json({
        success: true,
        message: "Manager registered successfully!",
      });
    } catch (error) {
      // Catch any unexpected server errors
      console.error("❌ Signup error:", error);
      res.status(500).json({
        success: false,
        message: "Server error, please try again later",
      });
    }
  }
);

/**
 * Check Email Route
 * -----------------
 * @route   POST /api/v1/check-email
 * @desc    Check if a given email already exists in the DB
 * @access  Public
 */
signupManager.post(
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
        .findOne({ email, deletedAt: null }) // Only check non-deleted accounts
        .select("email")
        .lean();

      if (existingManager) {
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

export default signupManager;
