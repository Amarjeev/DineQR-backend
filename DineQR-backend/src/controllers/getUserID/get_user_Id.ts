import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";

const get_user_Id_Router = Router();

/**
 * GET /api/v1/:role/get/userId
 *
 * Purpose: Extracts user ID from JWT token based on user role
 * This endpoint is typically used to identify the current user for cart operations,
 * session management, or personalized data retrieval
 *
 * Flow:
 * 1. verifyToken middleware authenticates the request and attaches user data
 * 2. Extracts role from URL parameters (e.g., 'customer', 'staff', 'admin')
 * 3. Retrieves userId from the token payload based on the specified role
 * 4. Returns the userId to frontend for client-side operations
 *
 * Common Use Cases:
 * - Finding cart items for the logged-in user
 * - Personalizing user dashboard
 * - Loading user-specific preferences
 * - Identifying user for order processing
 */
get_user_Id_Router.get(
  "/api/v1/:role/get/userId",
  verifyToken(""), // Token verification for all roles
  async (req: MultiUserRequest, res: Response) => {
    try {
      const role = req.params.role ? req.params.role.toLowerCase().trim() : "";

      // Get userId based on role from token payload
      const userId = req[role as keyof MultiUserRequest]?.userId;
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      if (!userId) {
        return res
          .status(404)
          .json({
            success: false,
            message: "User ID not found for this role.",
          });
      }

      // Send userId to frontend for cart operations or user identification
      return res.status(200).json({ success: true, userId, hotelKey });
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

export default get_user_Id_Router;
