import { Request, Response, NextFunction } from "express";

export const mgr_HotelInfo_Validation_Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    contactNumber,
    email,
    openingTime,
    closingTime,
    website,
    address,
  } = req?.body?.formData;

  // Name check
  if (!name || name.length < 3 || name.length > 80) {
    res.status(400).json({
      success: false,
      message: "Restaurant/Hotel name must be between 3 and 80 characters.",
    });
    return;
  }

  // Contact Number check
  if (!contactNumber) {
    res.status(400).json({
      success: false,
      message: "Contact number is required.",
    });
    return;
  }

  // ✅ Indian mobile number check
  if (!/^[6-9]\d{9}$/.test(contactNumber)) {
    res.status(400).json({
      success: false,
      message:
        "Enter a valid Indian mobile number (10 digits, starting with 6-9).",
    });
    return;
  }

  // Email check
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).json({
      success: false,
      message: "Enter a valid email address.",
    });
    return;
  }

  if (email.length > 100) {
    res.status(400).json({
      success: false,
      message: "Email cannot exceed 100 characters.",
    });
    return;
  }

  // Time regex for "h:00 AM/PM"
  const timeRegex = /^(1[0-2]|0?[1-9]):00 (AM|PM)$/;

  // Opening & Closing Hours validation
  if (!openingTime || !closingTime) {
    res.status(400).json({
      success: false,
      message: "Opening and Closing times are required.",
    });
    return;
  }

  if (!timeRegex.test(openingTime)) {
    res.status(400).json({
      success: false,
      message: "Opening time must be in the format h:00 AM/PM",
    });
    return;
  }

  if (!timeRegex.test(closingTime)) {
    res.status(400).json({
      success: false,
      message: "Closing time must be in the format h:00 AM/PM",
    });
    return;
  }

  const convertTo24Hour = (time: string) => {
    const [hourStr, period] = time.split(/:00 | /);
    let hour = parseInt(hourStr || "0", 10);
    if (isNaN(hour)) hour = 0;
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour;
  };

  const openHour = convertTo24Hour(openingTime);
  const closeHour = convertTo24Hour(closingTime);

  if (openHour >= closeHour) {
    res.status(400).json({
      success: false,
      message: "Opening time must be earlier than closing time.",
    });
    return;
  }

  // Website / Social Links (optional)
  if (website) {
    if (website.length > 2000) {
      res.status(400).json({
        success: false,
        message: "Website/social link cannot exceed 2000 characters.",
      });
      return;
    }

    if (!/^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.+)?$/.test(website)) {
      res.status(400).json({
        success: false,
        message: "Enter a valid website or social link.",
      });
      return;
    }
  }

  // Address check
  if (!address || address.length < 10 || address.length > 150) {
    res.status(400).json({
      success: false,
      message: "Address must be between 10 and 150 characters.",
    });
    return;
  }

  // ✅ Passed all checks
  next();
};
