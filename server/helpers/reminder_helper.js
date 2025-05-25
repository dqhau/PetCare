import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

// Tạo transporter cho Nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Gửi email thông báo
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} content - Nội dung email (HTML hoặc text)
 * @returns {Promise} - Kết quả gửi email
 */
export const sendEmail = async (to, subject, content) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: content,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Tạo nội dung email nhắc lịch hẹn
 * @param {Object} booking - Thông tin đặt lịch
 * @param {Object} service - Thông tin dịch vụ
 * @param {Object} timeslot - Thông tin khung giờ
 * @returns {string} - Nội dung email HTML
 */
export const createReminderEmail = (booking, service, timeslot) => {
  const serviceName = service?.name || 'Không xác định';
  const bookingDate = new Date(booking.appointment_date).toLocaleDateString('vi-VN');
  const bookingTime = timeslot?.time || 'Không xác định';
  const customerName = booking.customer_name;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nhắc lịch hẹn</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 10px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #777;
        }
        .highlight {
          font-weight: bold;
          color: #4CAF50;
        }
        .button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Nhắc lịch hẹn sắp tới</h2>
        </div>
        <div class="content">
          <p>Xin chào <span class="highlight">${customerName}</span>,</p>
          <p>Chúng tôi gửi email này để nhắc bạn về lịch hẹn sắp tới tại PetCare:</p>
          <ul>
            <li><strong>Dịch vụ:</strong> ${serviceName}</li>
            <li><strong>Ngày:</strong> ${bookingDate}</li>
            <li><strong>Giờ:</strong> ${bookingTime}h</li>
          </ul>
          <p>Vui lòng đến đúng giờ để đảm bảo dịch vụ được thực hiện tốt nhất.</p>
          <p>Nếu bạn cần thay đổi lịch hẹn, vui lòng liên hệ với chúng tôi trước ít nhất 24 giờ.</p>
          <a href="http://localhost:3000/booking-status" class="button">Xem chi tiết lịch hẹn</a>
        </div>
        <div class="footer">
          <p>© 2025 PetCare. Tất cả các quyền được bảo lưu.</p>
          <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
          <p>Điện thoại: 0123 456 789</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Gửi email nhắc lịch hẹn
 * @param {Object} booking - Thông tin đặt lịch
 * @param {Object} service - Thông tin dịch vụ
 * @param {Object} timeslot - Thông tin khung giờ
 * @returns {Promise} - Kết quả gửi email
 */
export const sendReminderEmail = async (booking, service, timeslot) => {
  try {
    // Chỉ gửi email nếu có địa chỉ email
    if (!booking.email) {
      console.log('Không có địa chỉ email để gửi nhắc lịch');
      return null;
    }
    
    const emailContent = createReminderEmail(booking, service, timeslot);
    
    return await sendEmail(
      booking.email,
      `PetCare - Nhắc lịch hẹn dịch vụ ${service?.name || 'chăm sóc thú cưng'}`,
      emailContent
    );
  } catch (error) {
    console.error('Lỗi khi gửi email nhắc lịch:', error);
    return null;
  }
};
