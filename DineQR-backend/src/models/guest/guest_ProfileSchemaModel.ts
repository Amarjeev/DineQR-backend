import mongoose, { Schema, Document } from 'mongoose'

// ===============================
// 🧩 Interfaces for type safety
// ===============================
export interface IHotelOrderGroup {
  hotelId: string
  orders: string[] // just store order IDs as strings
}

export interface ICurrentOrder {
  orderId: string
  expireAt?: Date // only for TTL auto-delete
}

export interface IUser extends Document {
  mobileNumber: string
  hotelOrders: IHotelOrderGroup[]
  currentOrders: ICurrentOrder[]
}

// ===============================
// 🕒 Current Orders Schema (TTL 24 hours)
// ===============================
// MongoDB deletes document automatically 24 hours after 'expireAt'
const CurrentOrderSchema = new Schema<ICurrentOrder>({
  orderId: { type: String, required: true },
  expireAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour expiry
    expires: 0, // TTL trigger (immediate when time reached)
  },
})

// ===============================
// 🏨 Hotel Orders Schema
// ===============================
const HotelOrderGroupSchema = new Schema<IHotelOrderGroup>({
  hotelId: { type: String, required: true },
  orders: { type: [String], default: [] },
})

// ===============================
// 👤 Main User Schema
// ===============================
const UserSchema = new Schema<IUser>(
  {
    mobileNumber: { type: String, required: true, unique: true },
    hotelOrders: { type: [HotelOrderGroupSchema], default: [] },
    currentOrders: { type: [CurrentOrderSchema], default: [] },
  },
  { timestamps: true }
)

// ===============================
// 🚀 Export Model
// ===============================
const GuestProfileSchema = mongoose.model<IUser>('Guest_profile', UserSchema)
 
export default GuestProfileSchema