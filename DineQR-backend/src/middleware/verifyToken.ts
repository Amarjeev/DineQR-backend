import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

// Extend Request type to include user property
export interface AuthRequest extends Request {
  cookies: { [key: string]: string };
}

/**
 * verifyTokenRole - returns middleware to verify JWT and user role
 * @param roleName - string, e.g., "manager",
 */
export const verifyToken = (roleName: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const token = req.cookies[`${roleName}_Token`];

      if (!token) {
        if (roleName === "manager") return res.redirect("/");
        return res.redirect("/");
      }

      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // Check user role
      if (decoded.role !== roleName) {
        res.status(403).json({ message: "Unauthorized role" });
        return;
      }

      (req as any)[roleName] = decoded;
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error occurred. Please try again later." });
    }
  };
};
