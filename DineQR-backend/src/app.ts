import  dotenv  from 'dotenv';
import express, { Application } from "express";
import connectDB from "./config/database"; 

dotenv.config();

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 5000;

// Middleware (optional)
app.use(express.json());
;

// Function to start server after DB connection
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

// Call startServer
startServer();
