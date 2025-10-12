import mongoose, { Schema, Document } from "mongoose";

// TypeScript interface for Menu_Item document
export interface IMenuItem extends Document {
  hotelKey: string;
  productName: string;
  sizes: {
    quarter: boolean;
    half: boolean;
    full: boolean;
  };
  prices: {
    quarter: string;
    half: string;
    full: string;
  };
  foodType: string; // veg / non-veg
  foodCategory: string; // category list
  availability: "Available" | "SoldOut" | "ComingSoon";
  isDeleted: boolean; // soft delete flag
  s3Url: { type: String }; // main image stored in S3
  blurHash: { type: String }; // lightweight placeholder
}

const validAvailability = ["Available", "SoldOut", "ComingSoon"] as const;
// Mongoose schema
const MenuItemSchema: Schema = new Schema<IMenuItem>(
  {
    hotelKey: { type: String, required: true, index: true }, // Unique key representing the hotel
    productName: { type: String, required: true, trim: true, index: true },
    sizes: {
      quarter: { type: Boolean, default: false },
      half: { type: Boolean, default: false },
      full: { type: Boolean, default: false },
    },
    prices: {
      quarter: { type: String, default: "" },
      half: { type: String, default: "" },
      full: { type: String, default: "" },
    },
    foodType: { type: String, required: true, lowercase: true, trim: true },
    foodCategory: { type: String, required: true, lowercase: true, trim: true },
    availability: {
      type: String,
      enum: validAvailability,
      default: "Available",
    },
    isDeleted: { type: Boolean, default: false }, // soft delete flag
    s3Url: { type: String }, // S3 URL of the main image
    blurHash: { type: String }, // BlurHash placeholder string
  },
  {
    timestamps: true, // automatically add createdAt and updatedAt fields
  }
);

// Create and export the model
const Menu_Item = mongoose.model<IMenuItem>("Menu_Item", MenuItemSchema);
export default Menu_Item;
