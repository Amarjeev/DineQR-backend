import mongoose, { Document, Schema } from "mongoose";

/**
 * Portion Type
 */
export interface IPortion {
  portion: string; // "full" | "half" | "quarter"
  price: number;
  quantity: number;
  subtotal: number;
}

/**
 * Item Type
 */
export interface IItem {
  _id?: string; // optional: MongoDB ObjectId or external id
  name: string;
  portions: IPortion[]; // supports multiple portions
}

/**
 * Enum for Kitchen Cancellation Reasons
 */
export enum KitchenCancelationReason {
  OUT_OF_INGREDIENTS = "Out of ingredients",
  KITCHEN_OVERLOADED = "Kitchen overloaded",
  ITEM_NOT_AVAILABLE = "Item not available",
  TECHNICAL_ISSUE = "Technical issue",
  CUSTOMER_REQUEST = "Customer request",
  QUALITY_CONCERNS = "Quality concerns",
}

/**
 * Enum for Guest Cancellation Reasons
 */
export enum GuestCancelationReason {
  CHANGE_OF_PLANS = "Change of plans",
  FOUND_BETTER_ALTERNATIVE = "Found a better alternative",
  ORDER_PLACED_BY_MISTAKE = "Order placed by mistake",
  DELIVERY_TIME_TOO_LONG = "Delivery time too long",
  ITEM_UNAVAILABLE = "Item unavailable",
  DUPLICATE_ORDER = "Duplicate order",
  INCORRECT_ORDER_DETAILS = "Incorrect order details",
  PRICE_TOO_HIGH = "Price too high",
  OTHER_REASON = "Other reason",
}

/**
 * Order Type
 */
export interface IOrder extends Document {
  hotelKey: string;
  orderId: string;
  orderedBy: "manager" | "staff" | "guest";
  orderedById: string;
  mobileNumber: string;
  orderType: "dining" | "parcel";
  tableNumber?: string;
  email?: string;
  items: IItem[];

  // 🔹 Guest cancellation
  orderCancelled: boolean;
  orderCancelationReason?: GuestCancelationReason;

  // 🔹 Kitchen cancellation
  kitchOrderCancelation: boolean;
  kitchOrdercancelationReason?: KitchenCancelationReason;

  // 🔹 Order status
  orderAccepted: boolean;
  orderDelivered: boolean;
  paymentStatus: boolean;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Portion Schema
 */
const PortionSchema = new Schema<IPortion>(
  {
    portion: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 500 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

/**
 * Item Schema
 */
const ItemSchema = new Schema<IItem>(
  {
    _id: { type: String }, // can store external id or leave for Mongo default
    name: { type: String, required: true, trim: true },
    portions: { type: [PortionSchema], required: true }, // multiple portions
  },
  { _id: false } // disable auto _id generation inside items
);

/**
 * Order Schema
 */
const OrderSchema = new Schema<IOrder>(
  {
    // 🔸 Basic order info
    hotelKey: { type: String, required: true, index: true },
    orderId: { type: String, required: true, unique: true, index: true },
    orderedBy: {
      type: String,
      enum: ["manager", "staff", "guest"],
      required: true,
    },
    orderedById: { type: String, required: true },
    mobileNumber: {
      type: String,
      required: true,
      match: /^\+91[0-9]{10}$/,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      maxlength: 254,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    orderType: { type: String, enum: ["dining", "parcel"], required: true },
    tableNumber: {
      type: String,
      required: function () {
        return this.orderType === "dining";
      },
    },

    // 🔸 Order items
    items: {
      type: [ItemSchema],
      required: true,
      validate: [
        (val: IItem[]) => val.length > 0,
        "Order must have at least 1 item",
      ],
    },

    // 🔹 Guest cancellation
    orderCancelled: { type: Boolean, default: false },
    orderCancelationReason: {
      type: String,
      enum: [...Object.values(GuestCancelationReason), ""],
      default: "",
    },
    // 🔹 Kitchen cancellation
    kitchOrderCancelation: { type: Boolean, default: false },
    kitchOrdercancelationReason: {
      type: String,
      enum: [...Object.values(KitchenCancelationReason), ""],
      default: "",
    },

    // 🔹 Status and flags
    orderAccepted: { type: Boolean, default: false },
    orderDelivered: { type: Boolean, default: false },
    paymentStatus: { type: Boolean, default: false },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const OrderSchemaModel = mongoose.model<IOrder>("Orders", OrderSchema);

export default OrderSchemaModel;
