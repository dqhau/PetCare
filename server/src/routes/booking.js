import express from "express";
import bookingController from "../controllers/booking.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

// Core booking routes

// Lấy danh sách tất cả các booking (chỉ admin mới có quyền)
bookingRouter.get("/", verifyAccessToken, bookingController.getAllBookings);

// Lấy danh sách tất cả các booking theo user
bookingRouter.get("/user/:userId", verifyAccessToken, bookingController.getBookingsByUser);

// Lấy thông tin booking theo ID
bookingRouter.get("/detail/:id", bookingController.getBookingById);

// Thêm booking mới - không yêu cầu đăng nhập
bookingRouter.post("/", bookingController.createBooking);

// Cập nhật trạng thái booking và lý do nếu chuyển thành 'cancel' api cho user
bookingRouter.put("/update-status/:id", verifyAccessToken, bookingController.updateBookingStatus);

// Cập nhật trạng thái booking và tạo lịch sử tiêm chủng nếu cần
bookingRouter.put("/update-status-with-history/:id", verifyAccessToken, bookingController.updateBookingStatusWithHistory);

// Xóa booking theo ID
bookingRouter.delete("/:id", verifyAccessToken, bookingController.deleteBooking);

// Admin dashboard statistics - can be simplified later if needed
bookingRouter.get("/stats/count-by-status", bookingController.getBookingStatsByStatus);

export default bookingRouter;
