import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();
// Tạo transporter cho Nodemailer (sử dụng cấu hình giống như trong users.js)
const createTransporter = () => {
  // Log để debug

  
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

    const info = await transporter.sendMail(mailOptions);

    return { status: "Success", info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { status: "Error", error: error.message };
  }
};
