import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";

const get_user_Id_Router = Router();

get_user_Id_Router.get(
  "/api/v1/:role/get/userId",
  verifyToken(''),
  async (req: MultiUserRequest, res: Response) => {
    try {
      const role = req.params.role ? req.params.role.toLowerCase().trim() : "";

      // Get userId based on role
      const userId = req[role as keyof MultiUserRequest]?.userId;

      if (!userId) {
        return res.status(404).json({ success: false, message: "User ID not found for this role." });
      }

      // Send userId to frontend
      return res.status(200).json({ success: true, userId });
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

export default get_user_Id_Router;
