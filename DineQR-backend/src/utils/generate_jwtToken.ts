import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = "your_secret_key"; // directly assign secret
// directly assign expire time as string
const JWT_EXPIRES_IN: SignOptions["expiresIn"] = "2d";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
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
