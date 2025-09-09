import mongoose, { Schema, Document } from 'mongoose';

export interface ManagerProfile extends Document {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: string;
  createdAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

const ManagerProfileSchemaModel: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, trim: true },
  mobileNumber: { type: String, required: true, index: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'manager', index: true },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
});

export default mongoose.model<ManagerProfile>('Manager_Profile', ManagerProfileSchemaModel);
