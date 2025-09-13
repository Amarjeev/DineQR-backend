import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to sanitize file paths and force them into a specific folder.
 * @param folder - Base folder where all files must live (e.g., uploads/)
 * @param field - Which part of req contains the user path: 'query', 'params', 'body'
 * @param key - The key containing the filename/path (e.g., req.query.file)
 */
export function sanitizePathMiddleware(
  folder: string,
  field: "query" | "params" | "body",
  key: string
) {
  // Resolve folder once
  const canonicalFolder = fs.realpathSync(folder);

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const entry = req[field][key];

      if (!entry || entry.length === 0) {
        res.status(400).json({ error: "❌ Invalid file path" });
        return;
      }

      if (path.isAbsolute(entry)) {
        res.status(400).json({ error: "❌ Absolute paths not allowed" });
        return;
      }

      // Canonicalize requested path inside the folder
      const requestedPath = path.join(canonicalFolder, entry);
      const canonicalEntry = fs.realpathSync(requestedPath);

      if (!canonicalEntry.startsWith(canonicalFolder + path.sep)) {
        res.status(403).json({ error: "❌ Path traversal attempt blocked" });
        return;
      }

      req.safeFilePath = canonicalEntry;
      next();
    } catch (err: any) {
      console.error("Path sanitization error:", err.message);
      res.status(400).json({ error: "❌ Invalid file path" });
      return;
    }
  };
}
