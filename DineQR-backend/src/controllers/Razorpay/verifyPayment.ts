import express, { Request, Response, Router } from "express";
import crypto from "crypto";
import Order_Schema from "../../models/orders/order_SchemaModel";
import { redis } from "../../config/redis";

const razorPay_Webhook_Router = Router();

razorPay_Webhook_Router.post(
  "/api/v1/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    console.log("✅ Razorpay webhook received");

    const signature = req.headers["x-razorpay-signature"] as string;
    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    try {
      // Razorpay sends raw body, not parsed JSON
      const rawBody =
        req.body instanceof Buffer
          ? req.body.toString()
          : JSON.stringify(req.body);

      // Verify signature
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.log("❌ Invalid signature");
        res.status(400).json({ success: false, message: "Invalid signature" });
        return;
      }

      // Parse event
      const event = JSON.parse(rawBody);
      console.log("📦 Event Type:", event.event);
      console.log("📦 Full Payload:", JSON.stringify(event, null, 2));

      // Example: handle captured payment
      if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;
        const order = await Order_Schema.findOne({
          razorpayOrderId: payment.order_id,
        });

        if (order) {
          order.paymentStatus = true;
          order.razorpayPaymentId = payment.id;
          await order.save();

          // Clear cache
          const redisKey = `guestOrders-list:${order.hotelKey}:${order.orderedById}`;
          await redis.del(redisKey);
          console.log("✅ Order updated & cache cleared");
        }
      }

      res.status(200).json({ success: true });
      return;
    } catch (error) {
      console.error("⚠️ Webhook error:", error);
      res.status(500).json({ success: false });
    }
  }
);

export default razorPay_Webhook_Router;
