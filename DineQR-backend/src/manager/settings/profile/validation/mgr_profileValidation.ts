import { Request, Response, NextFunction } from "express";

export const mgr_Profile_Validation_Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, mobileNumber, password, rePassword } = req.body;

  // Name validation
  if (
    !name ||
    typeof name !== "string" ||
    name.length < 3 ||
    name.length > 50 ||
    !/^[A-Za-z\s]+$/.test(name)
  ) {
    res.status(400).json({
      message: "Name must be 3–50 characters and only letters/spaces",
    });
    return;
  }

  // Email validation
  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254
  ) {
    res.status(400).json({ message: "Invalid email address" });
    return;
  }

  // Mobile number validation
  if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
    res.status(400).json({ message: "Mobile number must be 10 digits" });
    return;
  }

  // Password validation (only if password is provided)
  if (password) {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,15}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Password must be 6–15 chars, include 1 lowercase, 1 uppercase, 1 number, 1 special char",
      });
      return;
    }

    // Re-password validation (only if password is provided)
    if (!rePassword || password !== rePassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }
  }

  // All validations passed
  next();
};
