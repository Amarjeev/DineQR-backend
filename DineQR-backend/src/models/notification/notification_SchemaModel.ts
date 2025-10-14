import mongoose, { Document, Schema, Model } from "mongoose";

// =======================================================
// 📘 TypeScript Interface
// =======================================================
export interface INotification extends Document {
  hotelKey: string; // Hotel identifier
  messageType: "orderSuccess" | "cancelOrder" | "stockAlert"; // Can extend later with union type
  existUsers: string[]; // Current active hotel user IDs
  messageReaders: string[]; // Who viewed the message
  messageDelete: string[]; // Who deleted the message
  messageContent: string; // Message text
  createdAt?: Date; // Auto timestamp
}

// =======================================================
// 🧱 Mongoose Schema
// =======================================================
const NotificationSchema: Schema<INotification> = new Schema(
  {
    hotelKey: { type: String, required: true, index: true },

    messageType: {
      type: String,
      enum: ["orderSuccess", "cancelOrder", "stockAlert"],
      required: true,
    },

    existUsers: {
      type: [String],
      default: [],
    },

    messageReaders: {
      type: [String],
      default: [],
    },

    messageDelete: {
      type: [String],
      default: [],
    },

    messageContent: {
      type: String,
      required: true,
      trim: true,
    },

    // 🕓 CreatedAt field
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "20d", // ⏳ Auto delete after 20 days
    },
  },
  {
    timestamps: false, // We use custom createdAt instead of timestamps
    versionKey: false,
  }
);

// =======================================================
// 🚀 Mongoose Model Export
// =======================================================
const NotificationSchemaModel: Model<INotification> =
  mongoose.model<INotification>("Notification", NotificationSchema);

export default NotificationSchemaModel;
