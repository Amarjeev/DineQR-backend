import { Request, Response, NextFunction } from "express";

export const validateBillData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { restaurantName, address, gstNumber, contactNumber } = req.body;

  if (
    !restaurantName ||
    restaurantName.length < 3 ||
    restaurantName.length > 80
  ) {
    res.status(400).json({ success: false, error: "Invalid restaurant name" });
    return;
  }

  if (!address || address.length < 10 || address.length > 150) {
    res.status(400).json({ success: false, error: "Invalid address" });
    return;
  }

  if (!gstNumber || gstNumber.length !== 15) {
    res.status(400).json({ success: false, error: "Invalid GST number" });
    return;
  }

  if (!/^\d{10}$/.test(contactNumber)) {
    res.status(400).json({ success: false, error: "Invalid contact number" });
    return;
  }

  // All validations passed
  next();
};
