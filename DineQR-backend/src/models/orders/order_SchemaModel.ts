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
 * Order Type
 */
export interface IOrder extends Document {
  hotelKey: string;
  orderId: string;
  orderedBy: "manager" | "staff";
  mobileNumber: string;
  orderType: "dining" | "parcel";
  tableNumber?: string;
  items: IItem[];
  orderAccepted: boolean;
  orderCancelled: boolean;
  paymentStatus: boolean;
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
    quantity: { type: Number, required: true, min: 1 },
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
    hotelKey: { type: String, required: true, index: true },
    orderId: { type: String, required: true, unique: true, index: true },
    orderedBy: {
      type: String,
      enum: ["manager", "staff"],
      required: true,
    },
    mobileNumber: { type: String, required: true, match: /^[0-9]{10}$/ },
    orderType: { type: String, enum: ["dining", "parcel"], required: true },
    tableNumber: {
      type: String,
      required: function () {
        return this.orderType === "dining";
      },
    },
    items: {
      type: [ItemSchema],
      required: true,
      validate: [
        (val: IItem[]) => val.length > 0,
        "Order must have at least 1 item",
      ],
    },
    orderAccepted: { type: Boolean, default: false },
    orderCancelled: { type: Boolean, default: false },
    paymentStatus: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const OrderSchemaModel = mongoose.model<IOrder>("Orders", OrderSchema);

export default OrderSchemaModel;
