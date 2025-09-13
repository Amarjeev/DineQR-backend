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
import helmet from "helmet";
import { sanitizePathMiddleware } from "./middleware/sanitizePath";
import path from "path";
import fs from "fs";

// Database connection
import connectDB from "./config/database";

// Routes
import emailCheckRouter from "./controllers/checkEmail/check_Email";
import signupManagerRouter from "./controllers/signup/mgr_Signup";
import loginManagerRouter from "./controllers/login/mgr_Login";
import Mgr_OtpVerificationRouter from "./controllers/otpVerification/Mgr_OtpVerification";
import mgr_checkEmail_ResetpwdRouter from "./controllers/forgotPassword/mgr_checkEmail_Resetpwd";
import mgr_newPassword_ResetpwdRouter from "./controllers/forgotPassword/mgr_newPassword_Resetpwd";
import mgr_verifyOtp_ResetpwdRouter from "./controllers/forgotPassword/mgr_verifyOtp_Resetpwd";

// Load environment variables from .env
dotenv.config();

// Create an Express application
const app: Application = express();

declare global {
  namespace Express {
    interface Request {
      safeFilePath?: string;
    }
  }
}

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });


app.get("/download", sanitizePathMiddleware(UPLOADS_DIR, "query", "file"), (req, res) => {
  res.sendFile(req.safeFilePath!);
});

app.post("/upload", sanitizePathMiddleware(UPLOADS_DIR, "body", "filename"), (req, res) => {
  res.json({ safePath: req.safeFilePath });
});
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

app.use(helmet.hidePoweredBy());

// const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

app.use(function(_req, res, next) {
  res.setHeader('X-Frame-Options', 'sameorigin');
  next();
});

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true, // start with Helmet’s defaults
    directives: {
      defaultSrc: ["'self'"], // fallback for all resources
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // ⚠️ only if you need inline scripts (try to remove later)
        "https://cdn.jsdelivr.net",
        "https://apis.google.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // needed for Tailwind/React inline styles
        "https://fonts.googleapis.com",
      ],
      imgSrc: [
        "'self'",
        "data:", // allow base64 inline images (logos, previews)
        "https:",
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        "http://localhost:5000", // your API (dev)
        "http://localhost:5173", // your React frontend (dev)
        "https://dine-qr-website.vercel.app", // your deployed frontend
        "https://api.com", // any external APIs you call
      ],
      frameAncestors: ["'none'"], // disallow embedding in iframes
      objectSrc: ["'none'"], // block Flash, etc.
      upgradeInsecureRequests: [], // auto-upgrade http → https
    },
  })
);

// Use frameguard middleware to prevent clickjacking
app.use(
  helmet.frameguard({
    action: "deny", // blocks all framing attempts (X-Frame-Options: DENY)
  })
);







/**
 * --------------------------
 * API Routes
 * --------------------------
 */
app.use(signupManagerRouter); // Manager signup routes
app.use(emailCheckRouter); // email exist db checking routes
app.use(loginManagerRouter); // Manager login routes
app.use(Mgr_OtpVerificationRouter); // Manager otp verification routes

app.use(mgr_checkEmail_ResetpwdRouter);
app.use(mgr_newPassword_ResetpwdRouter);
app.use(mgr_verifyOtp_ResetpwdRouter);
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
    console.error("Server failed to start:", error);
    process.exitCode = 1; // Exit process if DB connection fails
  }
};

startServer();
