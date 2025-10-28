import { sendEmail } from "../../services/sendEmail";
import orderApprovedUI from "../../emailTemplates/order_ApprovedUI";
import orderCanceledUI from "../../emailTemplates/order_CanceledUI";
import HotelInfo_Schema from "../../models/manager/mgr_HotelInfoSchemaModel";
import orderDeliveredUI from "../../emailTemplates/order_DeliverdUI";
import { redis } from "../../config/redis";
import { calculate_Order_Total } from "../../utils/calculateTotal";
import Bill_Schema from "../../models/manager/mgr_BillSchemaModel";


export interface IHotelInfo {
  name: string;
  address: string;
  contactNumber: string;
  hotelKey: string;
}

export interface OrderData {
  email: string;
  orderId: string;
  createdAt: Date;
  items: any[];
  hotelKey: string;
  tableNumber?: number | string;
}

/**
 * 🔹 Send order status notification emails (confirmation or cancellation)
 */
export const sendOrderNotification = async (
  hotelKey: string,
  orderData: OrderData,
  status: "confirm" | "cancel" | "deliverd",
  cancellationReason?: string
): Promise<void> => {
  try {
    const cacheKey = `hotelInfo:${hotelKey}`;
    let hotelInfo: IHotelInfo | null = null;

    // --------------------------
    // 🔹 Try fetching from Redis
    // --------------------------
    const hotelInfoStr = await redis.get(cacheKey);
    if (hotelInfoStr) {
      hotelInfo = hotelInfoStr as IHotelInfo;
    } else {
      // --------------------------
      // 🔹 Fetch from MongoDB if not cached
      // --------------------------
      hotelInfo = await HotelInfo_Schema.findOne({ hotelKey })
        .select("name contactNumber address hotelKey")
        .lean<IHotelInfo>();

      if (!hotelInfo) {
        console.warn(`Hotel info not found for key: ${hotelKey}`);
        return;
      }

      // Cache for 15 minutes
      await redis.set(cacheKey, JSON.stringify(hotelInfo), { ex: 900 });
    }

    const { name: hotelName, address: hotelAddress, contactNumber } = hotelInfo;

    // ---------------------------------------------
    // 🔹 Calculate total order amount
    // ---------------------------------------------
    const totalAmount = calculate_Order_Total(orderData);

    // ---------------------------------------------
    // 🔹 Prepare email template
    // ---------------------------------------------
    let emailTemplate;
    if (status === "confirm") {
      emailTemplate = orderApprovedUI(
        orderData.email,
        hotelName,
        hotelAddress,
        contactNumber,
        orderData.orderId,
        totalAmount,
        orderData.createdAt,
        new Date()
      );
    } else if (status === "cancel") {
      emailTemplate = orderCanceledUI(
        orderData.email,
        hotelName,
        hotelAddress,
        contactNumber,
        orderData.orderId,
        totalAmount,
        cancellationReason ?? "No reason provided",
        orderData.createdAt,
        new Date()
      );
    } else if (status === "deliverd") {
      const BillInfo = await Bill_Schema
        .findOne({ hotelKey, deleted: false })
        .select("gstNumber contactNumber");

      // Check if BillInfo exists and has the required fields
      const gstNumber = BillInfo?.gstNumber || "";
      const billContactNumber = BillInfo?.contactNumber || contactNumber;

      emailTemplate = orderDeliveredUI(
        orderData.email,
        hotelName,
        hotelAddress,
        billContactNumber, // Use bill contact number or fallback to hotel contact number
        gstNumber, // GST number from bill schema
        orderData.orderId,
        orderData.tableNumber?.toString() || "Parcel",
        orderData.items,
        totalAmount,
        orderData.createdAt,
        new Date()
      );
    }

    // --------------------------
    // 🔹 Send email
    // --------------------------
    await sendEmail({
      toEmail: orderData.email,
      subject:
        status === "confirm"
          ? `✅ Order Approved - ${hotelName}`
          : status === "cancel"
          ? `❌ Order Cancelled - ${hotelName}`
          : `🎉 Order Delivered - ${hotelName}`,
      htmlContent: (await emailTemplate)?.html || "",
    });
  } catch (error) {
    console.error("❌ Error sending order notification:", error);
    throw error;
  }
};
