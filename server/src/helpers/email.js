import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();
// Tạo transporter cho Nodemailer (sử dụng cấu hình giống như trong users.js)
const createTransporter = () => {
  // Log để debug
  console.log('Cấu hình email service:', {
    service: process.env.EMAIL_SERVICE,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? '***' : undefined
  });
  
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Tạo transporter mới mỗi khi gửi email để đảm bảo lấy được cấu hình mới nhất

/**
 * Gửi email thông báo
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} content - Nội dung email (HTML hoặc text)
 * @param {boolean} isHtml - Nếu true, nội dung sẽ được gửi dưới dạng HTML
 * @returns {Promise} - Kết quả gửi email
 */
export const sendEmail = async (to, subject, content, isHtml = true) => {
  try {    
    console.log('Bắt đầu gửi email đến:', to);
    const transporter = createTransporter();
    
    // Thêm các header giúp tránh bị đánh dấu là spam
    const mailOptions = {
      from: `"PetCare Service" <${process.env.EMAIL_USER}>`, // Đặt tên người gửi rõ ràng
      to,
      subject,
      headers: {
        'Precedence': 'bulk',
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`
      }
    };
    
    // Sử dụng HTML hoặc text tùy thuộc vào tham số
    if (isHtml) {
      mailOptions.html = content;
      // Thêm phiên bản text cho các trình đọc email không hỗ trợ HTML
      mailOptions.text = content.replace(/<[^>]*>/g, ''); // Loại bỏ các thẻ HTML
    } else {
      mailOptions.text = content;
    }

    console.log('Chuẩn bị gửi email với options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi thành công:', info);

    return { status: "Success", info };
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    return { status: "Error", error: error.message };
  }
};

export const generateReminderEmailTemplate = (booking) => {
  const appointmentDate = new Date(booking.appointment_date);
  const formattedDate = appointmentDate.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Lấy giờ từ timeslot
  const time = booking.timeslot.time;
  const formattedTime = `${time}:00`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 0 0 5px 5px;
        }
        .appointment-details {
          background-color: white;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
          border-left: 4px solid #4CAF50;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🐾 Nhắc Lịch Khám Thú Cưng</h2>
        </div>
        <div class="content">
          <p>Xin chào quý khách,</p>
          
          <p>PetCare xin nhắc nhở bạn về lịch khám sức khỏe thú cưng <strong>vào ngày mai</strong>.</p>
          
          <div class="appointment-details">
            <h3>📅 Thông Tin Lịch Hẹn:</h3>
            <p><strong>Ngày hẹn:</strong> ${formattedDate}</p>
            <p><strong>Giờ hẹn:</strong> ${formattedTime}</p>
            <p><strong>Dịch vụ:</strong> ${booking.service_type?.name || 'Chưa xác định'}</p>
            ${booking.pet_name ? `<p><strong>Thú cưng:</strong> ${booking.pet_name}</p>` : ''}
            <p><strong>Địa chỉ:</strong> PetCare - Địa chỉ phòng khám</p>
          </div>

          <p><strong>Lưu ý quan trọng:</strong></p>
          <ul>
            <li>Vui lòng đến trước giờ hẹn 10-15 phút để làm thủ tục</li>
            <li>Mang theo sổ theo dõi sức khỏe thú cưng (nếu có)</li>
            <li>Đảm bảo thú cưng được vệ sinh sạch sẽ trước khi đến khám</li>
          </ul>

          <p>Nếu bạn cần thay đổi lịch hẹn, vui lòng liên hệ với chúng tôi càng sớm càng tốt.</p>

          <center>
            <a href="http://localhost:3000/booking" class="button">Xem Chi Tiết Lịch Hẹn</a>
          </center>
        </div>
        
        <div class="footer">
          <p>Trân trọng,<br>Đội ngũ PetCare</p>
          <p>Hotline: 0123 456 789<br>
          Email: support@petcare.com</p>
          <small>Email này được gửi tự động, vui lòng không trả lời.</small>
        </div>
      </div>
    </body>
    </html>
  `;
};
