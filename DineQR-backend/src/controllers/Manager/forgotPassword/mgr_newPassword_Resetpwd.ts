import { Router, Request, Response } from "express";
import Manager_Profile_Schema from "../../../models/manager/mgr_ProfileSchemaModel";
import bcrypt from "bcryptjs";

const mgr_newPassword_Resetpwd_Router = Router();

/**
 * @route   POST /api/v1/forgot-password/create-newpassword
 * @desc    Step 3 of Manager Password Reset - Set new password
 * @access  Public
 *
 * Request Body:
 * {
 *   email: string,           // Manager's email
 *   newPassword: string,     // New password
 *   confirmPassword: string  // Confirm new password
 * }
 *
 * Process:
 *  0. Validate request body
 *  1. Check if passwords match
 *  2. Hash new password using bcrypt
 *  3. Update manager's password in MongoDB
 *  4. Respond with success message
 *
 * Response:
 * 200 -> { success: true, message: "Password updated successfully" }
 * 400 -> { success: false, message: "Validation failed" }
 * 404 -> { success: false, message: "Account not found" }
 * 500 -> { success: false, message: "Internal server error" }
 */
mgr_newPassword_Resetpwd_Router.post(
  "/api/v1/forgot-password/create-newpassword",
  async (req: Request, res: Response) => {
    try {
      const { newPassword, confirmPassword, email } = req.body;

      // ================================
      // 0. Validate request body
      // ================================
      if (!email || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Email, newPassword, and confirmPassword are required",
        });
      }

      // ================================
      // Backend Password Validation (safe)
      // ================================
      if (
        newPassword.length < 6 ||
        newPassword.length > 15 ||
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,15}$/.test(
          newPassword
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid password format",
        });
      }

      // ================================
      // 1. Check if passwords match
      // ================================
      if (newPassword !== confirmPassword) { 
        return res.status(400).json({
          success: false,
          message: "Passwords do not match",
        });
      }

      // ================================
      // 2. Hash the password before saving
      // ================================
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // ================================
      // 3. Update manager's password in DB
      // ================================
      const updatedManager = await Manager_Profile_Schema.findOneAndUpdate(
        { email, isDeleted: false },
        { password: hashedPassword },
        { new: true }
      );

      if (!updatedManager) {
        return res.status(404).json({
          success: false,
          message: "Account not found",
        });
      }

      // ================================
      // 4. Respond to client
      // ================================
      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("New Password Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export default mgr_newPassword_Resetpwd_Router;
