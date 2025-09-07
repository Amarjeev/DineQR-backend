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

// Database connection
import connectDB from "./config/database";

// Routes
import signupManager from "./controllers/signup/manager_Signup";

// Load environment variables from .env
dotenv.config();

// Create an Express application
const app: Application = express();

// Define server port (fallback to 5000 if not defined in .env)
const PORT: number = Number(process.env.PORT) || 5000;

/**
 * --------------------------
 * Middleware Configuration
 * --------------------------
 */
app.use(express.json()); // Parse JSON request bodies

/**
 * --------------------------
 * API Routes
 * --------------------------
 */
app.use(signupManager); // Manager signup routes

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

    app.listen(PORT, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit process if DB connection fails
  }
};


startServer();
