import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";

// 🧱 Create a new router instance for handling token validation routes
const check_TokenValidation_Router = Router();

/**
 * ✅ Route: GET /api/v1/:role/check-token/validate
 *
 * This endpoint validates the JWT token for any user role (guest/staff/manager).
 * - Uses middleware `verifyToken()` to check and decode JWT.
 * - Accepts a query parameter `hotelKey` (mainly used for guests).
 * - For guests, it compares the query's hotelKey with the token's hotelKey.
 * - If mismatched → clears the user's auth cookie.
 * - If valid → returns { success: true }.
 */

check_TokenValidation_Router.get(
  "/api/v1/:role/check-token/validate",
  verifyToken(""), // 🔐 Verify token (middleware adds user data to request)
  (req: MultiUserRequest, res: Response) => {
    // Extract user role from URL (e.g. 'guest', 'staff', 'manager')
    const role = req.params.role ? req.params.role.toLowerCase().trim() : "";

    // 🧩 Guest-specific validation logic
    if (role === "guest") {
      // Query param from frontend URL: ?hotelKey=xxxx
      const currentHotelKey = req.query.hotelKey;

      // Hotel key extracted from decoded token (set by verifyToken middleware)
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      // 🚨 If currentHotelKey and token hotelKey mismatch — clear JWT cookie
      if (currentHotelKey !== hotelKey) {
        res.clearCookie(`${role}_Token`, {
          httpOnly: true, // prevent JS access
          secure: true, // only send over HTTPS
          sameSite: "strict", // prevent CSRF attacks
        });
      }
    }

    // ✅ If validation passes or role is not guest — return success response
    return res.json({ success: true });
  }
);

// 🚀 Export router to register in main Express app
export default check_TokenValidation_Router;
