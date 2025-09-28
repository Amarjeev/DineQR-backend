import { Request, Response, NextFunction } from "express";

export const mgr_Staff_profileValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    staffId,
    name,
    password,
    rePassword,
    skipPassword = false,
  } = req?.body?.formData;

  // 1️⃣ Validate staffId format: ST- followed by 6 digits
  const staffIdRegex = /^ST-\d{6}$/;
  if (!staffId || !staffIdRegex.test(staffId)) {
    res.status(400).json({
      success: false,
      message: "Invalid staffId format. Example: ST-616703",
    });
    return;
  }

  // 2️⃣ Validate name length
  if (!name || name.trim().length < 3 || name.trim().length > 25) {
    res.status(400).json({
      success: false,
      message: "Name must be between 3 and 25 characters",
    });
    return;
  }

  if (!skipPassword) {
    // 3️⃣ Validate password length
    if (!password || password.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
      return;
    }

    // 4️⃣ Validate rePassword
    if (!rePassword || password !== rePassword) {
      res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
      return;
    }
  }

  // Passed validation, proceed to next middleware/controller
  next();
};
