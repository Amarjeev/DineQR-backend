import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

// directly assign expire time as string
const JWT_EXPIRES_IN: SignOptions["expiresIn"] = "10d";

export interface JwtPayload {
  hotelKey: string;
  email?: string;
  userId: string;
  name?: string;
  role?: string;
}

export const generateToken = (payload: JwtPayload): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };

  return jwt.sign(payload, JWT_SECRET, options);
};
