/**
 * ================================================
 * EduSpark Backend - Entry Point
 * -----------------------------------------------
 * Well-structured entry point for the backend:
 * - Loads environment variables
 * - Connects to MongoDB
 * - Starts Express server
 * - Registers global middlewares & routes
 * ================================================
 */

import dotenv from "dotenv";
import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { securityHeaders } from "./middleware/WebsiteSecurity/securityHeaders";
import fileManagerRoutes from "./middleware/WebsiteSecurity/fileRoutes";
import compression from "compression";

// Database connection
import connectDB from "./config/database";

// Route imports
import emailCheckRouter from "./controllers/checkEmail/check_Email";
import mgr_Signup_Router from "./controllers/signup/mgr_Signup";
import mgr_Login_Router from "./controllers/login/mgr_Login";
import Mgr_OtpVerification_Router from "./controllers/otpVerification/Mgr_OtpVerification";
import mgr_checkEmail_Resetpwd_Router from "./controllers/forgotPassword/mgr_checkEmail_Resetpwd";
import mgr_newPassword_Resetpwd_Router from "./controllers/forgotPassword/mgr_newPassword_Resetpwd";
import mgr_verifyOtp_Resetpwd_Router from "./controllers/forgotPassword/mgr_verifyOtp_Resetpwd";
import mgr_Menu_AddItem_Roter from "./manager/Menu/AddMenuItemse/mgr_Menu_AddItem";
import mgr_get_MenuByCategory_Router from "./manager/Menu/EditMenuItemse/mgr_get_MenuByCategory";
import mgr_get_MenuEdit_Router from "./manager/Menu/EditMenuItemse/mgr_get_MenuEdit_Item";
import mgr_update_EditMenuItem_Router from "./manager/Menu/EditMenuItemse/mgr_update_EditMenuItem";
import mgr_delete_EditMenuItem from "./manager/Menu/EditMenuItemse/mgr_Delete_EditMenuItem";

// Load environment variables from .env
dotenv.config();

// Create Express app instance
const app: Application = express();

// Extend Express Request type to include safeFilePath
declare global {
  namespace Express {
    interface Request {
      safeFilePath?: string;
    }
  }
}

// ✅ File handling routes middleware
app.use("/", fileManagerRoutes);

// Define server port with fallback
const PORT: number = Number(process.env.PORT) || 5000;

// ✅ CORS configuration for allowed frontends
const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173", "https://dine-qr-website.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true, // Enable cookies/auth headers
};

/**
 * --------------------------
 * Middleware Setup
 * --------------------------
 */
app.use(express.json()); // Parse JSON requests
app.use(cors(corsOptions)); // Enable CORS
app.use(cookieParser()); // Parse cookies
app.use(helmet());

// ✅ Apply compression middleware
app.use(
  compression({
    level: 6, // 0-9 (default: system decides)
    threshold: 1024, // Only compress responses > 1KB
  })
);

// Apply custom security headers middleware
app.use(securityHeaders);

// Helmet frameguard for additional clickjacking protection
app.use(
  helmet.frameguard({
    action: "deny", // Deny all framing attempts
  })
);

/**
 * --------------------------
 * API Routes
 * --------------------------
 */
app.use(mgr_Signup_Router); // Manager signup routes
app.use(emailCheckRouter); // Email existence check routes
app.use(mgr_Login_Router); // Manager login routes
app.use(Mgr_OtpVerification_Router); // OTP verification routes

app.use(mgr_checkEmail_Resetpwd_Router); // Forgot password email check
app.use(mgr_newPassword_Resetpwd_Router); // Set new password
app.use(mgr_verifyOtp_Resetpwd_Router); // OTP verification for password reset
app.use(mgr_Menu_AddItem_Roter); //Menu item adding items
app.use(mgr_get_MenuByCategory_Router); //Menu item List items fetching
app.use(mgr_get_MenuEdit_Router); //Menu edit items
app.use(mgr_update_EditMenuItem_Router);
app.use(mgr_delete_EditMenuItem);

/**
 * --------------------------
 * Start Server
 * --------------------------
 * Connects to MongoDB and starts Express server
 */
const startServer = async (): Promise<void> => {
  try {
    await connectDB(); // Initialize MongoDB connection

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running at port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exitCode = 1; // Exit process if DB connection fails
  }
};

// Launch server
startServer();
