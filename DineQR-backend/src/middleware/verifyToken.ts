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
}

/**
 * verifyTokenRole - returns middleware to verify JWT and user role
 * @param roleName - string, e.g., "manager",
 */
export const verifyToken = (roleName: "manager" | "staff") => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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
        return res.status(403).json({ message: "Unauthorized role" });
      }

      if (roleName === "manager") req.manager = decoded;
      // else if (roleName === "staff") req.staff = decoded;

      next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error occurred. Please try again later." });
    }
  };
};
