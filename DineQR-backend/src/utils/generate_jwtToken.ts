import dotenv from "dotenv";
import jwt, { SignOptions } from "jsonwebtoken";

// Load environment variables from .env file
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JwtPayload): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN) as any,
  };

  return jwt.sign(payload, JWT_SECRET, options);
};
