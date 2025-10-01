import { MultiUserRequest } from './../../../types/user';
import { Router, Response } from "express";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";


const mgr_Logout_Router = Router();

mgr_Logout_Router.post(
  "/api/v1/manager/logout",
  verifyToken("manager"),
  async (_req: MultiUserRequest, res: Response) => {
    try {
      // Clear the cookie
      res.clearCookie("manager_Token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server error while logging out",
      });
    }
  }
);

export default mgr_Logout_Router;
