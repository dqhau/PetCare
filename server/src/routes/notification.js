import express from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import notificationController from "../controllers/notification.js";

const notificationRouter = express.Router();

// Core notification routes

// Lấy thông báo cho user hiện tại
notificationRouter.get("/", verifyAccessToken, notificationController.getAllNotifications);

// Lấy thông báo cho user cụ thể (admin only)
notificationRouter.get("/user/:userId", verifyAccessToken, notificationController.getNotificationsByUserId);

// Đánh dấu một thông báo đã đọc
notificationRouter.put("/:id/read", verifyAccessToken, notificationController.markAsRead);

// Đánh dấu tất cả thông báo đã đọc
notificationRouter.put("/read-all", verifyAccessToken, notificationController.markAllAsRead);

// Đếm thông báo chưa đọc
notificationRouter.get("/unread-count", verifyAccessToken, notificationController.getUnreadCount);

// Tạo thông báo
notificationRouter.post("/", verifyAccessToken, notificationController.createNotification);

export default notificationRouter;
