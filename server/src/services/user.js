import User from '../models/user.js';
import bcrypt from 'bcrypt';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../helpers/email.js';

/**
 * Dịch vụ xử lý logic nghiệp vụ liên quan đến người dùng
 */
const userService = {
  /**
   * Đăng ký người dùng mới
   * @param {Object} userData - Dữ liệu người dùng (username, password, fullname, email)
   * @returns {Promise<Object>} Thông tin người dùng đã lưu
   */
  async registerUser(userData) {
    const { username, password, fullname } = userData;
    
    // Kiểm tra dữ liệu đầu vào
    if (!username || !password || !fullname) {
      throw createError.BadRequest("Yêu cầu nhập đầy đủ thông tin");
    }
    
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await User.findOne({ username: username }).exec();
    if (existingUser) throw createError.Conflict("Người dùng đã tồn tại");
  
    
    // Mã hóa mật khẩu
    const hashPass = await bcrypt.hash(
      password,
      parseInt(process.env.PASSWORD_SECRET)
    );
    
    // Tạo người dùng mới với role mặc định là 'user'
    const newUser = new User({
      fullname, 
      username, 
      password: hashPass, 
      role: "user"
    });
    
    // Lưu người dùng vào database
    const savedUser = await newUser.save();
    return savedUser;
  },
  
  /**
   * Đăng nhập người dùng
   * @param {string} username - Tên đăng nhập
   * @param {string} password - Mật khẩu
   * @returns {Promise<Object>} Thông tin người dùng
   */
  async loginUser(username, password) {
    // Tìm kiếm người dùng theo username
    const user = await User.findOne({ username: username }).exec();
    
    // Nếu không tìm thấy người dùng
    if (!user) {
      throw createError.Unauthorized("Tài khoản hoặc mật khẩu không chính xác");
    }
    
    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createError.Unauthorized("Tài khoản hoặc mật khẩu không chính xác");
    }
    
    return user;
  },
  
  /**
   * Lấy thông tin người dùng theo username
   * @param {string} username - Tên đăng nhập
   * @returns {Promise<Object>} Thông tin người dùng
   */
  async getUserByUsername(username) {
    const user = await User.findOne({ username }).exec();
    if (!user) throw createError.NotFound("Không tìm thấy người dùng");
    return user;
  },
  
  /**
   * Cập nhật thông tin người dùng
   * @param {string} username - Tên đăng nhập
   * @param {Object} userData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Thông tin người dùng đã cập nhật
   */
  async updateUser(username, userData) {
    const user = await User.findOneAndUpdate(
      { username },
      { $set: userData },
      { new: true }
    ).exec();
    
    if (!user) throw createError.NotFound("Không tìm thấy người dùng");
    return user;
  },
  
  /**
   * Tìm người dùng theo email (dùng cho quên mật khẩu)
   * @param {string} email - Email người dùng
   * @returns {Promise<Object>} Thông tin người dùng
   */
  async findUserByEmail(email) {
    console.log('Đang tìm user với email:', email);
    
    // Kiểm tra tất cả users để debug
    const allUsers = await User.find({}).exec();
    console.log('Tất cả users trong DB:', allUsers.map(u => ({
      id: u._id,
      email: u.email,
      username: u.username
    })));
    
    const user = await User.findOne({ email }).exec();
    console.log('Kết quả tìm kiếm:', user ? 'Tìm thấy user' : 'Không tìm thấy user');
    if (!user) throw createError.NotFound("Không tìm thấy người dùng với email này");
    return user;
  },
  
  /**
   * Cập nhật mật khẩu người dùng
   * @param {string} id - ID người dùng
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise<Object>} Thông tin người dùng đã cập nhật
   */
  async updatePassword(id, newPassword) {
    try {
      // Mã hóa mật khẩu mới
      const hashPass = await bcrypt.hash(
        newPassword,
        parseInt(process.env.PASSWORD_SECRET)
      );
      
      // Cập nhật mật khẩu
      const user = await User.findByIdAndUpdate(
        id,
        { password: hashPass },
        { new: true }
      );
      
      if (!user) throw createError.NotFound("Không tìm thấy người dùng");
      return user;
    } catch (error) {
      throw error;
    }
  },
  /**
   * Lấy tất cả người dùng
   * @returns {Promise<Array>} Danh sách người dùng
   */
  async fetchAllUsers() {
    try {
      return await User.find({}).exec();
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Xử lý quên mật khẩu
   * @param {string} email - Email của người dùng
   * @returns {Promise<Object>} Thông tin về việc gửi email
   */
  async handleForgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw createError.NotFound("User not found");
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const clientUrl = process.env.CLIENT_URL;
    const resetLink = `${clientUrl}/reset-password/${token}`;

    const emailOptions = {
      to: email,
      subject: "Reset Password - PetCare",
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password. This link will expire in 15 minutes.</p>
        <a href="${resetLink}">Reset Password</a>
      `,
    };

    return await sendEmail(emailOptions);
  },

  /**
   * Xóa người dùng
   * @param {string} userId - ID của người dùng cần xóa
   * @returns {Promise<Object>} Kết quả xóa người dùng
   */
  async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw createError.NotFound("Không tìm thấy người dùng");
    }

    if (user.role === "admin") {
      throw createError.Forbidden("Không thể xóa tài khoản admin");
    }

    await User.findByIdAndDelete(userId);
    return { status: true, message: "Xóa người dùng thành công" };
  },

  /**
   * Chỉnh sửa thông tin người dùng theo ID
   * @param {string} userId - ID của người dùng
   * @param {Object} updateData - Dữ liệu cần cập nhật
   * @returns {Promise<Object>} Thông tin người dùng sau khi cập nhật
   */
  async editUserById(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      throw createError.NotFound("Không tìm thấy người dùng");
    }
    return user;
  },

  /**
   * Đổi mật khẩu người dùng
   * @param {string} username - Tên đăng nhập
   * @param {string} oldPassword - Mật khẩu cũ
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise<Object>} Kết quả thay đổi mật khẩu
   */
  async changePassword(username, oldPassword, newPassword) {
    const user = await this.getUserByUsername(username);
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw createError.BadRequest("Mật khẩu cũ không chính xác");
    }

    await this.updatePassword(user._id, newPassword);
    return { status: true, message: "Cập nhật mật khẩu thành công" };
  }
};

export default userService;
