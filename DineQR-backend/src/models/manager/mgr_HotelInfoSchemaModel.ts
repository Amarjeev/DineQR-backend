import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  hotel: string; // ✅ New hotel key
  contactNumber: string;
  email: string;
  openingTime: string;
  closingTime: string;
  website?: string;
  address: string;
}

const RestaurantSchema: Schema = new Schema(
  {
    name: { type: String, require: true }, // Restaurant name
    hotelKey: { type: String, required: true, index: true },
    contactNumber: { type: String, required: true }, // Contact Number
    email: { type: String, required: true }, // Email ID
    openingTime: { type: String, required: true }, // Opening Time
    closingTime: { type: String, required: true }, // Closing Time
    website: { type: String }, // Website / Social Links (optional)
    address: { type: String, required: true }, // Address
  },
  { timestamps: true }
);

const HotelInfoSchema = mongoose.model<IRestaurant>(
  "Hotel_info",
  RestaurantSchema
);

export default HotelInfoSchema;
