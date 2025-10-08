import axios from "axios";
import { Router, Request, Response } from "express";

const sendOtpRouter = Router();

// MSG91 Authkey and approved template ID
const MSG91_AUTHKEY = "472576A2dxi9sv68e60bfaP1";
const MSG91_TEMPLATE_ID = "68e60fbe60a9b73d0d061812";

sendOtpRouter.post("/send-order-sms", async (req: Request, res: Response) => {
  const { phone, orderId, hotelName, totalAmount } = req.body;

  if (!phone || !orderId || !hotelName || !totalAmount) {
    res.status(400).json({ error: "All fields are required" });
    return
  }

  try {
    const response = await axios.get(
      `https://api.msg91.com/api/v5/flow/` +
        `?authkey=${MSG91_AUTHKEY}` +
        `&flow_id=${MSG91_TEMPLATE_ID}` +
        `&mobiles=91${phone}` +
        `&orderId=${encodeURIComponent(orderId)}` +
        `&hotelName=${encodeURIComponent(hotelName)}` +
        `&totalAmount=${encodeURIComponent(totalAmount)}`
    );

    res.json({
      success: true,
      message: "Order SMS sent successfully",
      apiResponse: response.data,
    });
  } catch (error: any) {
    console.error("❌ Error sending SMS:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || "Failed to send SMS",
    });
  }
});



export default sendOtpRouter;
