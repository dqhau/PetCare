import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/booking.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { startRemindBookingCronJob, sendRemindEmails } from './helpers/cronjob.js';

dotenv.config();

// Kết nối DB nếu chạy file này trực tiếp
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Nếu chạy file này trực tiếp: gửi nhắc lịch ngay và lên lịch cronjob
if (process.argv[1] && process.argv[1].endsWith('cronjob.js')) {
  sendRemindEmails();
  startRemindBookingCronJob();
}
