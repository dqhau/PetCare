import express from "express";
import { sendEmail } from "../helpers/email_helper.js";

const testRouter = express.Router();

// API endpoint để test gửi email
testRouter.get("/send-email", async (req, res) => {
  try {
    const result = await sendEmail(
      req.query.to || "your-email@example.com", // Email người nhận từ query hoặc mặc định
      "PetCare - Test Email",
      "Đây là email test từ hệ thống PetCare. Nếu bạn nhận được email này, có nghĩa là hệ thống gửi email đang hoạt động bình thường."
    );
    
    res.json({
      success: true,
      message: "Email đã được gửi",
      result
    });
  } catch (error) {
    console.error("Error in test email route:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi email",
      error: error.message
    });
  }
});

export default testRouter;
