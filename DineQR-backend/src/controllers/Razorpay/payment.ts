import { Router, Response } from "express";
import razorpay from "./razorpay";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import Order_Schema from "../../models/orders/order_SchemaModel";
import { calculate_Order_Total } from "../../utils/calculateTotal";

const razorPay_CreateOrder_Router = Router();

// Create Razorpay order
razorPay_CreateOrder_Router.post(
  "/api/v1/:role/razopay/create-order/:orderId",
  verifyToken(""), // check user token
  async (req: MultiUserRequest, res: Response) => {
    try {
      const role = req.params.role?.toLowerCase().trim(); // get role
      const orderId = req.params.orderId; // get orderId
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey; // get hotelKey

      // fetch order from DB
      const response = await Order_Schema.findOne({ hotelKey, orderId })
        .select("orderId items")
        .lean();

      if (!response) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      // calculate total amount
      const totalAmount = calculate_Order_Total(response);

      // prepare Razorpay options
      const options = {
        amount: Number(totalAmount) * 100, // amount in paise
        currency: "INR",
        receipt: response._id.toString(), // internal reference
        notes: {
          orderId: response.orderId,
          hotelKey: hotelKey,
        },
      };

      // create order on Razorpay
      const order = await razorpay.orders.create(options as any);
      // save razorpayOrderId to your order document
      await Order_Schema.findOneAndUpdate(
        { _id: response._id },
        { razorpayOrderId: order.id } // save Razorpay order id
      );

      // send order, amount in paise, and keyId to frontend
      res.status(200).json({
        data: order, // Razorpay order object
        amount: Number(totalAmount) * 100, // total amount in paise
        keyId: process.env.RAZORPAY_KEY_ID, // frontend uses this key for payment
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating order" });
    }
  }
);

export default razorPay_CreateOrder_Router;
