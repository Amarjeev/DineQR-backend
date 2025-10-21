import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

// Extend Request type to include user property
export interface AuthRequest extends Request {
  cookies: { [key: string]: string };
  manager?: JwtPayload;
  staff?: JwtPayload;
  guest?: JwtPayload;
}

/**
 * verifyTokenRole - returns middleware to verify JWT and user role
 * @param roleName - string, e.g., "manager",
 */
export const verifyToken = (roleName: "manager" | "staff" | "guest" | "") => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const effectiveRole = (roleName || req?.params?.role || "").toLowerCase();

      const token = req.cookies[`${effectiveRole}_Token`];

      if (!token) {
        // Send structured JSON response instead of redirect
        res.status(401).json({
          success: false,
          errorType: "INVALID_TOKEN",
          message: "Unauthorized access. Please login again.",
        });
        return;
      }
      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // Check user role
      if (decoded.role !== effectiveRole) {
        res.status(403).json({ message: "Unauthorized role" });
        return;
      }

      if (effectiveRole === "manager") req.manager = decoded;
      if (effectiveRole === "staff") req.staff = decoded;
       if (effectiveRole === "guest") req.guest = decoded;

      next();
    } catch (error) {
      res.status(500).json({
        message: "Server error occurred. Please try again later.",
        error,
      });
      return;
    }
  };
};
