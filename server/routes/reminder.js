import express from 'express';
import reminderController from '../controllers/reminderController.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route gửi nhắc lịch hẹn thủ công (chỉ admin)
router.post('/send', verifyAccessToken, reminderController.sendReminders);

// Route kiểm tra các lịch hẹn cần gửi nhắc (chỉ admin)
router.get('/check', verifyAccessToken, reminderController.checkAppointmentsToRemind);

export default router;
