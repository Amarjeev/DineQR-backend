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
