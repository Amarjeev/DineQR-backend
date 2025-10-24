import mongoose, { Schema, Document } from "mongoose";

export interface IStaff extends Document {
  staffId: string;
  name: string;
  password: string;
  isDeleted: boolean;
  hotelKey: string;
}

const StaffSchema: Schema = new Schema<IStaff>(
  {
    hotelKey: {
      type: String,
      required: true,
      trim: true,
    },
    staffId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Staff_Profile_Schema = mongoose.model<IStaff>("Staff_profile", StaffSchema);
export default Staff_Profile_Schema;
