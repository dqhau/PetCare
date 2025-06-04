//Sử dụng module 'express' để khởi tại web server
import cors from "cors";
import * as dotenv from 'dotenv';
import express, { json } from "express";

import connectDB from "./src/configs/database.js";
import { startRemindBookingCronJob } from "./src/helpers/cronjob.js";

// Khởi động cronjob nhắc lịch
startRemindBookingCronJob();

// Import core routes
import mainRouter from "./src/routes/index.js";

dotenv.config();
//Tạo 1 constant 'app'
const app = express();

// Cấu hình CORS chi tiết
const corsOptions = {
  origin: [process.env.CLIENT_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

//Thêm middleware kiểm soát dữ liệu của Request
app.use(cors(corsOptions));
app.use(json({ limit: '50mb' }));

//Kích hoạt router hoạt động định tuyến cho các request của client

app.get("/", (req, res) => {
  res.send("<h1>Welcome to PetCare API</h1>");
});
// Core application routes
app.use("/", mainRouter);

// Middleware để xử lý lỗi
app.use(function(err, req, res, next) {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Đã xảy ra lỗi trên máy chủ',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

const Port = process.env.PORT || 9999

//Lắng nghe các request gửi tới web server tại port

// Kết nối database trước khi khởi động server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(Port, () => {
      console.log(`Web server running on http://localhost:${Port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
