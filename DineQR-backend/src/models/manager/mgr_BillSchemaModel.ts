import mongoose, { Schema, Document } from "mongoose";

export interface IBill extends Document {
  hotelKey: string; // ID of the hotel/manager
  restaurantName: string;
  address: string;
  gstNumber: string;
  contactNumber: string;
  deleted: boolean; // soft delete flag
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema: Schema = new Schema(
  {
    hotelKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    restaurantName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 150,
    },
    gstNumber: {
      type: String,
      required: true,
      trim: true,
      length: 15,
      unique: true, // ensures unique GST per hotel
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{10}$/, // ensures 10-digit number
    },
    deleted: {
      type: Boolean,
      default: false, // false means active
    },
  },
  { timestamps: true }
);

const billSchema = mongoose.model<IBill>("Bill", BillSchema);

export default billSchema;
