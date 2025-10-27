import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import Staff_Profile_Schema from "../../../models/manager/mgr_Staff_ProfileSchemaModel";
import { generateToken } from "../../../utils/generate_jwtToken";

const staff_Login_Router = Router();

/**
 * POST /api/v1/auth/login/staff
 * 
 * Purpose: Authenticates staff members and provides JWT token for session management
 * This endpoint handles staff login with validation, credential verification, and token generation
 * 
 * Security Features:
 * - Input validation and sanitization
 * - Staff ID format validation (ST-XXXXXX)
 * - Password length validation
 * - Bcrypt password comparison
 * - HTTP-only cookie for token storage
 * - Secure cookie flags (httpOnly, secure, sameSite)
 * 
 * Flow:
 * 1. Input validation and formatting
 * 2. Staff ID pattern verification
 * 3. Database lookup for active staff profiles
 * 4. Password hash comparison
 * 5. JWT token generation with staff details
 * 6. Secure cookie setting for session persistence
 * 7. Success response with staff data
 * 
 * Error Handling:
 * - 400: Missing required fields
 * - 401: Invalid credentials (generic message for security)
 * - 500: Server errors and token generation failures
 */
staff_Login_Router.post(
  "/api/v1/auth/login/staff",
  async (req: Request, res: Response) => {
    try {
      // Step 1: Extract and sanitize input data
      const { staffId, password } = req.body;

      // Step 2: Trim whitespace from credentials for clean data processing
      const trimmedStaffId = (staffId || "").trim();
      const trimmedPassword = (password || "").trim();

      // Step 3: Validate required fields are present
      if (!trimmedStaffId || !trimmedPassword) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      // Step 4: Validate Staff ID format (ST- followed by 6 digits)
      const staffIdRegex = /^ST-\d{6}$/;
      if (!staffIdRegex.test(trimmedStaffId)) {
        return res.status(401).json({
          success: false,
          message: "Invalid Staff ID or password", // Generic message for security
        });
      }

      // Step 5: Validate password meets minimum length requirement
      if (trimmedPassword.length < 8) {
        return res.status(401).json({
          success: false,
          message: "Invalid Staff ID or password", // Generic message for security
        });
      }

      // Step 6: Database lookup - Find active staff member
      const userData = await Staff_Profile_Schema.findOne({
        staffId: trimmedStaffId, // Use trimmed staffId for query
        isDeleted: false,
      })
        .select("staffId name password hotelKey")
        .lean();

      // Step 7: Verify staff exists in database
      if (!userData) {
        return res.status(401).json({
          success: false,
          message: "Invalid Staff ID or password",
        });
      }

      // Step 8: Compare provided password with hashed password in database
      const isMatch = await bcrypt.compare(trimmedPassword, userData.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid Staff ID or password",
        });
      }

      // Step 9: Generate JWT token with staff information
      const token = generateToken({
        hotelKey: userData?.hotelKey,
        userId: userData?.staffId,
        name: userData?.name,
        role:"staff"
      });

      // Step 10: Verify token generation was successful
      if (!token) {
        return res.status(500).json({
          success: false,
          message: "Server error: Could not generate authentication token",
        });
      }

      // Step 11: Set secure HTTP-only cookie with JWT token
      res.cookie("staff_Token", token, {
        httpOnly: true,    // Prevents XSS attacks
        secure: true,      // Only sent over HTTPS
        sameSite: "none",   // CSRF protection
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days expiration
      });

      // Step 12: Return successful login response
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: userData?.name, // Return staff name for frontend display
      });

    } catch (error) {
      console.error("❌ Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error, please try again later",
      });
    }
  }
);

export default staff_Login_Router;