import mongoose from 'mongoose';
import Booking from '../models/booking.js';
import { sendEmail, generateReminderEmailTemplate } from './email.js';
import cron from 'node-cron';

/**
 * Gửi email nhắc lịch khám cho các booking ngày mai
 */
export async function sendRemindEmails() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // Lấy tất cả booking có lịch hẹn vào ngày mai và đang trong trạng thái xử lý
    const bookings = await Booking.find({
      order_status: 'Processing',
      appointment_date: {
        $gte: tomorrow,
        $lte: endOfTomorrow
      }
    }).populate('userId').populate('service_type').populate('timeslot');

    for (const booking of bookings) {
      const email = booking.userId?.email || booking.email;
      if (!email) continue;
      const subject = '🐾 Nhắc Lịch Khám Thú Cưng - PetCare';
      const content = generateReminderEmailTemplate(booking);
      await sendEmail(email, subject, content, true);
    }
    console.log(`Đã gửi nhắc lịch cho ${bookings.length} booking ngày mai.`);
  } catch (err) {
    console.error('Cronjob sendRemindEmails lỗi:', err);
  }
}

/**
 * Khởi động cronjob gửi nhắc lịch mỗi ngày lúc 7h sáng
 */
export function startRemindBookingCronJob() {
  // Thiết lập cronjob với lịch biểu '0 7 * * *'
  // Ý nghĩa:
  //   0   7   *   *   *
  //   |   |   |   |   |
  //   |   |   |   |   +--- Thứ trong tuần (0 - 6, 0 là Chủ nhật)
  //   |   |   |   +------- Tháng (1 - 12)
  //   |   |   +----------- Ngày trong tháng (1 - 31)
  //   |   +--------------- Giờ (0 - 23)
  //   +------------------- Phút (0 - 59)
  // Lịch này nghĩa là: Vào 6:00 chiều mỗi ngày (giờ Việt Nam), sẽ chạy hàm sendRemindEmails
  cron.schedule('0 18 * * *', sendRemindEmails, {
    timezone: 'Asia/Ho_Chi_Minh',
  });
  console.log("[CRONJOB] Đã kích hoạt gửi email nhắc lịch hẹn mỗi ngày lúc 6h chiều.");
}


// Nếu chạy file này trực tiếp: connect DB, gửi nhắc lịch ngay và lên lịch cronjob
if (process.argv[1] && process.argv[1].endsWith('cronjob.js')) {
  import('dotenv').then(dotenv => {
    dotenv.config();
    if (!mongoose.connection.readyState) {
      mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    sendRemindEmails();
    startRemindBookingCronJob();
  });
}
