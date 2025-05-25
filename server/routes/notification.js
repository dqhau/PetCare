import express from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import notificationController from "../controllers/notification.js";

const notificationRouter = express.Router();

// Lấy thông báo - API cho frontend hiện tại
notificationRouter.get("/", verifyAccessToken, notificationController.getAllNotifications); // API mặc định cho frontend

// API chi tiết hơn cho admin/user
notificationRouter.get("/admin", verifyAccessToken, notificationController.getAllNotifications); // Lấy thông báo cho admin
notificationRouter.get("/user/:userId", verifyAccessToken, notificationController.getNotificationsByUserId); // Lấy thông báo cho user cụ thể

// Đánh dấu đã đọc
notificationRouter.put("/:id/read", verifyAccessToken, notificationController.markAsRead); // Đánh dấu một thông báo đã đọc

// Đánh dấu tất cả đã đọc - API cho frontend hiện tại
notificationRouter.put("/read-all", verifyAccessToken, notificationController.markAllAsRead); // API mặc định cho frontend

// API chi tiết hơn cho admin/user
notificationRouter.put("/admin/read-all", verifyAccessToken, notificationController.markAllAsRead); // Đánh dấu tất cả thông báo của admin đã đọc
notificationRouter.put("/user/:userId/read-all", verifyAccessToken, notificationController.markAllAsReadForUser); // Đánh dấu tất cả thông báo của user đã đọc

// Đếm thông báo chưa đọc
notificationRouter.get("/unread-count", verifyAccessToken, notificationController.getUnreadCount); // API mặc định cho frontend
notificationRouter.get("/admin/unread-count", verifyAccessToken, notificationController.getUnreadCount); // Đếm thông báo chưa đọc của admin
notificationRouter.get("/user/:userId/unread-count", verifyAccessToken, notificationController.getUnreadCountForUser); // Đếm thông báo chưa đọc của user

// Tạo thông báo
notificationRouter.post("/", verifyAccessToken, notificationController.createNotification);

export default notificationRouter;
