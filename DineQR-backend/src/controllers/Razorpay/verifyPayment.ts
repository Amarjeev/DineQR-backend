import crypto from "crypto";
import express, { Router, Request, Response } from "express";
import Order_Schema from "../../models/orders/order_SchemaModel";
import { redis } from "../../config/redis";

const razorPay_Verify_payment_Router = Router();

// Parse raw body for webhook signature verification
razorPay_Verify_payment_Router.post(
  "/api/v1/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    console.log("Razorpay webhook called");
    const signature = req.headers["x-razorpay-signature"] as string;
    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    // 1️⃣ Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature === signature) {
      const event = JSON.parse(req.body.toString());
      const razorpay_order_id = event.payload.payment.entity.order_id;
      const razorpay_payment_id = event.payload.payment.entity.id;

      try {
        // 2️⃣ Find order by Razorpay order ID or receipt
        const order = await Order_Schema.findOne({
          razorpayOrderId: razorpay_order_id,
        });

        if (order) {
          order.paymentStatus = true;
          order.razorpayPaymentId = razorpay_payment_id;
          await order.save();

          // This ensures the next fetch retrieves fresh data
          const redisKey = `guestOrders-list:${order.hotelKey}:${order.orderedById}`;
          await redis.del(redisKey);
        }
        res.status(200).json({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  }
);

export default razorPay_Verify_payment_Router;
