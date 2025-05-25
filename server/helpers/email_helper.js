import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();
// Tạo transporter cho Nodemailer (sử dụng cấu hình giống như trong users.js)
const createTransporter = () => {
  // Log để debug
  console.log('Email config:', {
    service: process.env.EMAIL_SERVICE,
    user: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '...' : 'undefined',
    passLength: process.env.EMAIL_PASS ? 'provided' : 'undefined'
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
    // Log thông tin gửi email để debug
    console.log(`Attempting to send email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content length: ${content.length} characters`);
    
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
    console.log("Email sent successfully:", info.response);
    return { status: "Success", info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { status: "Error", error: error.message };
  }
};

/**
 * Tạo nội dung email xác nhận đặt lịch
 * @param {Object} booking - Thông tin đặt lịch
 * @param {Object} service - Thông tin dịch vụ
 * @param {Object} timeslot - Thông tin khung giờ
 * @returns {string} - Nội dung email HTML
 */
export const createBookingConfirmationEmail = (booking, service, timeslot) => {
  const bookingDate = new Date(booking.appointment_date).toLocaleDateString('vi-VN');
  const currentDate = new Date().toLocaleDateString('vi-VN');
  
  // Kiểm tra nếu có thông tin thú cưng
  let petInfoSection = '';
  if (booking.petId && booking.petId.name) {
    // Nếu petId đã được populate
    const pet = booking.petId;
    petInfoSection = `
      <h3 style="margin-top: 20px; color: #3498db;">Thông tin thú cưng</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 30%;"><strong>Tên:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pet.name || 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Loài:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pet.species || 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Giống:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pet.breed || 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Tuổi:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pet.age != null ? pet.age : 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Cân nặng:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pet.weight != null ? pet.weight + ' kg' : 'Không có'}</td>
        </tr>
      </table>`;
  } else {
    petInfoSection = `
      <h3 style="margin-top: 20px; color: #3498db;">Thông tin thú cưng</h3>
      <p>Không có thông tin chi tiết về thú cưng</p>
    `;
  }
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đặt lịch</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; border-top: 4px solid #3498db;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #3498db; margin: 0;">XÁC NHẬN ĐẶT LỊCH DỊCH VỤ</h2>
      </div>
      
      <p>Kính gửi <strong>${booking.customer_name}</strong>,</p>
      
      <p>Cảm ơn bạn đã đặt lịch dịch vụ tại PetCare. Đơn đặt lịch của bạn đã được tiếp nhận và đang chờ xác nhận.</p>
      
      <h3 style="margin-top: 20px; color: #3498db;">Chi tiết đặt lịch</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 30%;"><strong>Mã đặt lịch:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking._id}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Dịch vụ:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${service?.name || 'Không xác định'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Ngày:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Giờ:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${timeslot?.time || 'Không xác định'}h</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Trạng thái:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><span style="color: #f39c12; font-weight: bold;">Chờ xác nhận</span></td>
        </tr>
      </table>
      
      ${petInfoSection}
      
      <p>Chúng tôi sẽ thông báo cho bạn khi đơn đặt lịch được xác nhận.</p>
      
      <div style="background-color: #e8f4fc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #3498db;">Liên hệ hỗ trợ</h4>
        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua:</p>
        <ul style="margin-bottom: 0;">
          <li><strong>Email:</strong> <a href="mailto:support@petcare.com" style="color: #3498db;">support@petcare.com</a></li>
          <li><strong>Hotline:</strong> 0123-456-789</li>
        </ul>
      </div>
      
      <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ PetCare</strong></p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center;">
        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        <p>${currentDate}</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Tạo nội dung email thông báo đơn đã được xác nhận
 * @param {Object} booking - Thông tin đặt lịch
 * @param {Object} service - Thông tin dịch vụ
 * @param {Object} timeslot - Thông tin khung giờ
 * @returns {string} - Nội dung email HTML
 */
export const createBookingApprovedEmail = (booking, service, timeslot) => {
  const bookingDate = new Date(booking.appointment_date).toLocaleDateString('vi-VN');
  const currentDate = new Date().toLocaleDateString('vi-VN');
  
  // Kiểm tra nếu có thông tin thú cưng
  let petInfoSection = '';
  if (booking.pet_info) {
    petInfoSection = `
      <h3 style="margin-top: 20px; color: #27ae60;">Thông tin thú cưng</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 30%;"><strong>Tên:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.pet_info.pet_name || 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Loài:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.pet_info.species || 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Giống:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.pet_info.breed || 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Tuổi:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.pet_info.age != null ? booking.pet_info.age : 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Cân nặng:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.pet_info.weight != null ? booking.pet_info.weight + ' kg' : 'Không có'}</td>
        </tr>
      </table>`;
  }
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đơn đặt lịch đã được xác nhận</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; border-top: 4px solid #27ae60;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #27ae60; margin: 0;">ĐƠN ĐẶT LỊCH ĐÃ ĐƯỢC XÁC NHẬN</h2>
      </div>
      
      <p>Kính gửi <strong>${booking.customer_name}</strong>,</p>
      
      <p>Chúng tôi vui mừng thông báo rằng đơn đặt lịch của bạn đã được xác nhận.</p>
      
      <h3 style="margin-top: 20px; color: #27ae60;">Chi tiết đặt lịch</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 30%;"><strong>Mã đặt lịch:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking._id}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Dịch vụ:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${service?.name || 'Không xác định'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Ngày:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Giờ:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${timeslot?.time || 'Không xác định'}h</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Trạng thái:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><span style="color: #27ae60; font-weight: bold;">Đã xác nhận</span></td>
        </tr>
      </table>
      
      ${petInfoSection}
      
      <div style="background-color: #e8f6ef; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #27ae60;">Lưu ý quan trọng</h4>
        <p>Vui lòng đến đúng giờ. Nếu bạn cần thay đổi hoặc hủy lịch, vui lòng thông báo cho chúng tôi trước ít nhất 24 giờ.</p>
      </div>
      
      <div style="background-color: #e8f6ef; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #27ae60;">Liên hệ hỗ trợ</h4>
        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua:</p>
        <ul style="margin-bottom: 0;">
          <li><strong>Email:</strong> <a href="mailto:support@petcare.com" style="color: #27ae60;">support@petcare.com</a></li>
          <li><strong>Hotline:</strong> 0123-456-789</li>
        </ul>
      </div>
      
      <p>Cảm ơn bạn đã chọn dịch vụ của chúng tôi!</p>
      
      <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ PetCare</strong></p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center;">
        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        <p>${currentDate}</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Tạo nội dung email thông báo đơn đã bị hủy
 * @param {Object} booking - Thông tin đặt lịch
 * @param {Object} service - Thông tin dịch vụ
 * @param {Object} timeslot - Thông tin khung giờ
 * @param {string} cancelReason - Lý do hủy (nếu có)
 * @returns {string} - Nội dung email HTML
 */
export const createBookingCancelledEmail = (booking, service, timeslot, cancelReason) => {
  const bookingDate = new Date(booking.appointment_date).toLocaleDateString('vi-VN');
  const currentDate = new Date().toLocaleDateString('vi-VN');
  const reasonHtml = cancelReason ? `<div style="background-color: #fdedec; padding: 15px; border-radius: 5px; margin: 20px 0;"><h4 style="margin-top: 0; color: #e74c3c;">Lý do hủy</h4><p>${cancelReason}</p></div>` : '';
  
  // Kiểm tra nếu có thông tin thú cưng
  let petInfoSection = '';
  if (booking.pet_info) {
    petInfoSection = `
      <h3 style="margin-top: 20px; color: #e74c3c;">Thông tin thú cưng</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 30%;"><strong>Tên:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.pet_info.pet_name || 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Loài:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.pet_info.species || 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Giống:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.pet_info.breed || 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Tuổi:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.pet_info.age != null ? booking.pet_info.age : 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Cân nặng:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.pet_info.weight != null ? booking.pet_info.weight + ' kg' : 'Không có'}</td>
        </tr>
      </table>`;
  }
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đơn đặt lịch đã bị hủy</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; border-top: 4px solid #e74c3c;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #e74c3c; margin: 0;">ĐƠN ĐẶT LỊCH ĐÃ BỊ HỦY</h2>
      </div>
      
      <p>Kính gửi <strong>${booking.customer_name}</strong>,</p>
      
      <p>Chúng tôi xin thông báo rằng đơn đặt lịch của bạn đã bị hủy.</p>
      
      ${reasonHtml}
      
      <h3 style="margin-top: 20px; color: #e74c3c;">Chi tiết đặt lịch</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 30%;"><strong>Mã đặt lịch:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking._id}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Dịch vụ:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${service?.name || 'Không xác định'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Ngày:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Giờ:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${timeslot?.time || 'Không xác định'}h</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Trạng thái:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><span style="color: #e74c3c; font-weight: bold;">Đã hủy</span></td>
        </tr>
      </table>
      
      ${petInfoSection}
      
      <div style="background-color: #fdedec; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #e74c3c;">Đặt lịch lại</h4>
        <p>Nếu bạn muốn đặt lịch lại, vui lòng truy cập trang web của chúng tôi hoặc liên hệ trực tiếp với chúng tôi.</p>
      </div>
      
      <div style="background-color: #fdedec; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #e74c3c;">Liên hệ hỗ trợ</h4>
        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua:</p>
        <ul style="margin-bottom: 0;">
          <li><strong>Email:</strong> <a href="mailto:support@petcare.com" style="color: #e74c3c;">support@petcare.com</a></li>
          <li><strong>Hotline:</strong> 0123-456-789</li>
        </ul>
      </div>
      
      <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ PetCare</strong></p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center;">
        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        <p>${currentDate}</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
