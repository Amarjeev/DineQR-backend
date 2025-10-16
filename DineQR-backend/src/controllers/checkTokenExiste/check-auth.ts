import { Router, Request, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";

// Create a new router instance
const check_TokenValidation_Router = Router();

// Route to validate staff/manager/guest token

check_TokenValidation_Router.get(
  "/api/v1/:role/check-token/validate",
  verifyToken(""),
  (_req: Request, res: Response) => {
    // Send success response if token is valid
    return res.json({ success: true });
  }
);

// Export the router to be used in main app
export default check_TokenValidation_Router;
