import crypto from "crypto";
import express, { Request, Response, Router } from "express";
import Order_Schema from "../../models/orders/order_SchemaModel";
import { redis } from "../../config/redis";

const razorPay_Webhook_Router = Router();

// Must use express.raw for Razorpay
razorPay_Webhook_Router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    console.log("✅ Razorpay webhook received");

    const signature = req.headers["x-razorpay-signature"] as string;
    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    try {
      const body = req.body.toString(); // must convert buffer to string
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("❌ Invalid signature");
        res.status(400).json({ success: false, message: "Invalid signature" });
        return;
      }

      const event = JSON.parse(body);
      const razorpay_order_id = event.payload.payment.entity.order_id;
      const razorpay_payment_id = event.payload.payment.entity.id;

      const order = await Order_Schema.findOne({
        razorpayOrderId: razorpay_order_id,
      });
      if (order) {
        order.paymentStatus = true;
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // Clear Redis cache
        const redisKey = `guestOrders-list:${order.hotelKey}:${order.orderedById}`;
        await redis.del(redisKey);
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
