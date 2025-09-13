import { Router } from "express";
import path from "path";
import fs from "fs";
import { sanitizePathMiddleware } from "../middleware/sanitizePath";

const fileManagerRoutes = Router();

// Define folder
export const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Ensure the folder exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Download route
fileManagerRoutes.get(
  "/download",
  sanitizePathMiddleware(UPLOADS_DIR, "query", "file"),
  (req, res) => {
    res.sendFile(req.safeFilePath!);
  }
);

// Upload route
fileManagerRoutes.post(
  "/upload",
  sanitizePathMiddleware(UPLOADS_DIR, "body", "filename"),
  (req, res) => {
    res.json({ safePath: req.safeFilePath });
  }
);

export default fileManagerRoutes;
