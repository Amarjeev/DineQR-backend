import { Request } from "express";

// ✅ Common type for manager payload
export interface ManagerPayload {
  id: string;
  email: string;
  role: string;
}

export interface ManagerRequest extends Request {
  manager?: ManagerPayload;
}

// ***********************************************************************************************

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

// ✅ Request type allowing multiple managers and staff
export interface MultiUserRequest extends Request {
  manager?: UserPayload;
  staff?: UserPayload;
}
