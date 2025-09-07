import express, { Application} from "express";

const app: Application = express();
const PORT: number = 5000;

// Middleware (optional)
app.use(express.json());



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
