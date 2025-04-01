import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import mainRouter from "./src/routes/index.js";

dotenv.config(); // Load biến môi trường từ .env

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// Main API entry point
app.use("/api", mainRouter);

// Khởi động server
const start = async () => {
  try {
    await connectDB(); // Kết nối database trước khi chạy server

    app.listen(PORT, () => {
      console.log(`
      =================================
      Server chạy tại: http://localhost:${PORT}
      
      =================================
      `);
    });
  } catch (error) {
    console.error(" Không thể khởi động server:", error);
  }
};

start();
