import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import userService from '../services/userService.js';
import User from "../models/user.js";

// Cấu hình dotenv
dotenv.config();

/**
 * Lấy tất cả người dùng
 */
const getAllUsers = async (req, res) => {
  try {
    const allUsers = await userService.fetchAllUsers();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cập nhật thông tin người dùng
 */
const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.username, req.body);
    res.status(200).json(updatedUser);
    console.log("Edit user successfully");
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || "Lỗi cập nhật người dùng",
    });
    console.log("Edit user failed");
  }
};

/**
 * Lấy thông tin người dùng theo tên đăng nhập
 */
const getUserByUserName = async (req, res) => {
  try {
    const user = await userService.getUserByUsername(req.params.username);
    res.status(200).json(user);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Lỗi lấy thông tin người dùng" });
  }
};

const forgetPass = async (req, res) => {
  const { email } = req.body;
  try {
    // Sử dụng service để tìm người dùng theo email
    const user = await userService.findUserByEmail(email);

    // Tạo token JWT để gửi qua email
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ id: user._id }, jwtSecretKey, {
      expiresIn: "1h",
    });

    // Sử dụng thông tin email từ biến môi trường
    var transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const clientUrl = process.env.CLIENT_URL;
    const resetLink = `${clientUrl}/reset-password/${user._id}/${token}`;
    const currentDate = new Date().toLocaleDateString();
    var mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "PetCare - Đặt lại mật khẩu của bạn",
      text:
        `Kính gửi Quý khách hàng của PetCare,

Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản PetCare của bạn. Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:

${resetLink}

Lưu ý:
- Liên kết này chỉ có hiệu lực trong vòng 24 giờ kể từ khi bạn nhận được email này
- Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ của chúng tôi

Nếu bạn gặp bất kỳ vấn đề nào khi đặt lại mật khẩu, vui lòng liên hệ với chúng tôi qua:
- Email: support@petcare.com
- Hotline: 0123-456-789

Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ PetCare.

Trân trọng,
Đội ngũ PetCare
---------------------------------
Email này được gửi tự động, vui lòng không trả lời.
${currentDate}
`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.send({ Status: "Error sending email", Error: error.message });
      } else {
        return res.send({ Status: "Success" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.send({ Status: "Error", Error: error.message });
  }
};

/**
 * Đổi mật khẩu người dùng
 */
const changePass = async (req, res) => {
  try {
    const { username } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ status: false, message: "Thiếu thông tin yêu cầu" });
    }

    // Lấy thông tin người dùng
    const user = await userService.getUserByUsername(username);

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: false, message: "Mật khẩu cũ không chính xác" });
    }

    // Cập nhật mật khẩu mới
    await userService.updatePassword(user._id, newPassword);

    res
      .status(200)
      .json({ status: true, message: "Cập nhật mật khẩu thành công" });
  } catch (error) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};
/**
 * Xóa người dùng
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "Không tìm thấy người dùng" });
    }
    
    // Kiểm tra xem người dùng có phải là admin không
    if (user.role === "admin") {
      return res.status(403).json({ status: false, message: "Không thể xóa tài khoản admin" });
    }
    
    // Xóa người dùng (vẫn sử dụng User model trực tiếp vì service chưa có phương thức này)
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ status: true, message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ status: false, message: "Lỗi server", error: error.message });
  }
};

export default {
  getAllUsers,
  forgetPass,
  changePass,
  updateUser,
  getUserByUserName,
  deleteUser
};
