/**
 * ================================================
 * EduSpark Backend - Entry Point
 * -----------------------------------------------
 * 1. Loads environment variables
 * 2. Connects to MongoDB
 * 3. Starts Express server
 * 4. Registers global middlewares & routes
 * ================================================
 */

import dotenv from "dotenv";
import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";


// Database connection
import connectDB from "./config/database";

// Routes
import emailCheckRouter from "./controllers/checkEmail/check_Email";
import signupManagerRouter from "./controllers/signup/mgr_Signup";
import loginManagerRouter from "./controllers/login/mgr_Login";
import Mgr_OtpVerificationRouter from "./controllers/otpVerification/Mgr_OtpVerification";

// Load environment variables from .env
dotenv.config();

// Create an Express application
const app: Application = express();

// Define server port (fallback to 5000 if not defined in .env)
const PORT: number = Number(process.env.PORT) || 5000;

// ✅ CORS options
const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173", "https://dine-qr-website.vercel.app"], // allowed frontends
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allowed HTTP methods
  allowedHeaders: ["Content-Type"],
  credentials: true, // allow cookies or auth headers
};

/**
 * --------------------------
 * Middleware Configuration
 * --------------------------
 */
app.use(express.json()); // Parse JSON request bodies

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware to parse cookies
app.use(cookieParser());

/**
 * --------------------------
 * API Routes
 * --------------------------
 */
app.use(signupManagerRouter); // Manager signup routes
app.use(emailCheckRouter); // email exist db checking routes
app.use(loginManagerRouter); // Manager login routes
app.use(Mgr_OtpVerificationRouter); // Manager otp verification routes

/**
 * --------------------------
 * Start Server
 * --------------------------
 * 1. Connect to MongoDB
 * 2. Start Express server only after DB connection succeeds
 */
const startServer = async (): Promise<void> => {
  try {
    await connectDB(); // Initialize MongoDB connection

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running at port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit process if DB connection fails
  }
};

startServer();
