import mongoose, { Schema, Document, Model } from 'mongoose'
import cron from 'node-cron'

// -------------------------------
// TypeScript Interfaces
// -------------------------------
export interface INotification {
  title: string
  message: string
  read: boolean
  createdAt: Date
  expireAt: Date
}

export interface IHotelOrderGroup {
  hotelId: string
  orders: string[]
}

export interface ICurrentOrder {
  orderId: string
  hotelId: string
  expireAt?: Date
}

export interface IUser extends Document {
  mobileNumber: string
  hotelOrders: IHotelOrderGroup[]
  currentOrders: ICurrentOrder[]
  notifications: INotification[]
}

// -------------------------------
// Notification Schema
// -------------------------------
const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expireAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours
  },
})

// -------------------------------
// CurrentOrders Schema
// -------------------------------
const CurrentOrderSchema = new Schema<ICurrentOrder>({
  orderId: { type: String, required: true },
  hotelId: { type: String, required: true },
  expireAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 60 * 1000),
  },
})

// -------------------------------
// HotelOrders Schema
// -------------------------------
const HotelOrderGroupSchema = new Schema<IHotelOrderGroup>({
  hotelId: { type: String, required: true },
  orders: { type: [String], default: [] },
})

// -------------------------------
// Main User Schema
// -------------------------------
const UserSchema = new Schema<IUser>(
  {
    mobileNumber: { type: String, required: true, unique: true },
    hotelOrders: { type: [HotelOrderGroupSchema], default: [] },
    currentOrders: { type: [CurrentOrderSchema], default: [] },
    notifications: { type: [NotificationSchema], default: [] },
  },
  { timestamps: true }
)

// -------------------------------
// Static Method: Cleanup expired currentOrders & notifications
// -------------------------------
UserSchema.statics.cleanupExpiredData = async function () {
  const now = new Date()
  await this.updateMany(
    {},
    {
      $pull: {
        currentOrders: { expireAt: { $lte: now } },
        notifications: { expireAt: { $lte: now } },
      },
    }
  )
  console.log('🧹 Expired currentOrders and notifications cleaned from all users')
}

// -------------------------------
// ✅ Auto Cron Trigger: Runs every 10 minutes
// -------------------------------
cron.schedule('*/10 * * * *', async () => {
  try {
    const model = mongoose.models.Guest_profile as any
    if (model && model.cleanupExpiredData) {
      await model.cleanupExpiredData()
      console.log('✅ Cron: cleanupExpiredData executed successfully')
    }
  } catch (error) {
    console.error('❌ Cron: Failed to execute cleanupExpiredData', error)
  }
})

// -------------------------------
// Export Model
// -------------------------------
const GuestProfileSchema: Model<IUser> = mongoose.model<IUser>(
  'Guest_profile',
  UserSchema
)

export default GuestProfileSchema
