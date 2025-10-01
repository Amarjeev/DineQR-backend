import { Request } from "express";

export interface UserPayload {
  hotelKey: string;
  email: string;
  userId: string;
  role: string;
}

// ✅ Request type allowing multiple managers and staff
export interface MultiUserRequest extends Request {
  manager?: UserPayload;
  staff?: UserPayload;
}
