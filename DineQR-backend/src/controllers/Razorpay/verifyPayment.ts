import express, { Request, Response, Router } from "express";
import crypto from "crypto";
import Order_Schema from "../../models/orders/order_SchemaModel";
import { redis } from "../../config/redis";
import { Server as SocketIOServer } from "socket.io";
import { guest_Notifications } from "../../guest/notification/guest_Notifications";
import HotelInfo_Schema from "../../models/manager/mgr_HotelInfoSchemaModel";
import paymentSuccesUI from "../../emailTemplates/payment_Succes";
import { sendEmail } from "../../services/sendEmail";
import { calculate_Order_Total } from "../../utils/calculateTotal";

const razorPay_Webhook_Router = Router();

razorPay_Webhook_Router.post(
  "/api/v1/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
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

          const io = req.app.get("io") as SocketIOServer;
          // Emit real-time update to clients
          io.to(`${order.hotelKey}${order?.orderedById}`).emit(
            "updatePaymentStatusOrder",
            order?.orderId
          );

          await guest_Notifications(io, order, "💳payment");

          // Find hotel info by hotelKey
          const hotelInfo = await HotelInfo_Schema.findOne({
            hotelKey: order?.hotelKey,
          })
            .lean()
            .select("-createdAt -updatedAt -hotelKey -_id");

          const totalAmount = calculate_Order_Total(order);

          // 📧 Create Email Template
          const emailTemplate = paymentSuccesUI(
            hotelInfo?.email || "", // guest email preferred
            hotelInfo?.name || "",
            hotelInfo?.address || "",
            hotelInfo?.contactNumber || "",
            order?.orderId,
            totalAmount
          );

          // 📬 Send Email (only if email exists)
          if (order?.email) {
            await sendEmail({
              toEmail: order?.email || hotelInfo?.email || "",
              subject: "💳 Payment Successful - DineQR",
              htmlContent: emailTemplate.html,
            });
            console.log("📧 Payment success email sent!");
          }

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
