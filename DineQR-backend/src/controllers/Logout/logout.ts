import express, { Request, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";

const logout_Router = express.Router();

/**
 * @route   POST /api/v1/:role/Logout
 * @desc    Logout a user by clearing the authentication cookie
 * @access  Protected (requires valid token)
 */
logout_Router.post(
  "/api/v1/:role/Logout",
  verifyToken(""), // Middleware to verify token (can check role if needed)
  (req: Request, res: Response) => {
    try {
      // Get role from URL parameter
      const role = req.params.role?.toLowerCase().trim() || "";

      // ✅ This matches exactly how it was set during login
      res.clearCookie(`${role}_Token`, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/", // must match login cookie path
        domain: "dineqr-backend-3.onrender.com",
      });

      res.setHeader(
        "Set-Cookie",
        `${role}_Token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None`
      );

      // Send success response
      return res
        .status(200)
        .json({ message: "Logged out successfully", success: true });
    } catch (err) {
      console.error("Logout error:", err);
      return res
        .status(500)
        .json({ message: "Logout failed", error: err, success: false });
    }
  }
);

export default logout_Router;
