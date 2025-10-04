import { Request } from "express";

export interface ManagerPayload {
  hotelKey: string;
  email: string;
  userId: string;
  name: string;
  role: string;
}

export interface StaffPayload {
  hotelKey: string;
  userId: string;
  name: string;
  role: string;
}

// ✅ Request type allowing multiple managers and staff
export interface MultiUserRequest extends Request {
  manager?: ManagerPayload;
  staff?: StaffPayload;
}
