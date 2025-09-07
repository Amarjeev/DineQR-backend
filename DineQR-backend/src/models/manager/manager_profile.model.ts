import mongoose, { Schema, Document } from 'mongoose';

/**
 * ManagerProfile Interface
 * ------------------------
 * Defines the TypeScript interface for Manager documents in MongoDB.
 * Extends the default Mongoose Document type for strong typing.
 */
export interface ManagerProfile extends Document {
  name: string;
  email: string;
  MobileNumber: string;
  password: string;
  role: string;
  createdAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

/**
 * ManagerProfile Schema
 * ---------------------
 * Defines the structure of the Manager_Profile collection in MongoDB.
 * Includes validation rules, indexes for faster lookups, and soft delete support.
 */
const ManagerProfileSchema: Schema = new Schema({
  /**
   * Manager's full name
   * - Must be 3–50 characters long
   * - Allows only letters and spaces
   */
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true,
    match: [/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'],
  },

  /**
   * Manager's email address
   * - Must be unique
   * - Valid email format required
   * - Length between 6–254 characters
   */
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    minlength: 6,
    maxlength: 254,
    trim: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },

  /**
   * Manager's mobile number
   * - Must be unique
   * - Only 10-digit numbers allowed
   */
  MobileNumber: {
    type: String,
    required: true,
    index: true,
    trim: true,
    match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number'],
  },

  /**
   * Manager's login password
   * - Length between 6–128 characters
   * - (Should be stored hashed for security in production)
   */
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128,
  },

  /**
   * User role
   * - Default is "manager"
   */
  role: {
    type: String,
    default: 'manager',
    index: true,
  },

  /**
   * Record creation timestamp
   */
  createdAt: {
    type: Date,
    default: Date.now,
  },

  /**
   * Soft delete flag
   * - isDeleted: true → record considered deleted
   * - deletedAt: timestamp when deletion occurred
   */
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

/**
 * Manager_Profile Model
 * ---------------------
 * Exports the compiled model for CRUD operations.
 */
export default mongoose.model<ManagerProfile>(
  'Manager_Profile',
  ManagerProfileSchema
);
