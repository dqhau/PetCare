import User from '../models/user.js';
import bcrypt from 'bcrypt';
import createError from 'http-errors';

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
    const { username, password, fullname, email } = userData;
    
    // Kiểm tra dữ liệu đầu vào
    if (!username || !password || !fullname || !email) {
      throw createError.BadRequest("Yêu cầu nhập đầy đủ thông tin");
    }
    
    // Kiểm tra định dạng email hợp lệ
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw createError.BadRequest("Định dạng email không hợp lệ. Email phải có dạng example@domain.com");
    }
    
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await User.findOne({ username: username }).exec();
    if (existingUser) throw createError.Conflict("Người dùng đã tồn tại");
    
    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await User.findOne({ email: email }).exec();
    if (existingEmail) throw createError.Conflict("Email đã được sử dụng");
    
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
      email, 
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
    const user = await User.findOne({ email }).exec();
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
  }
};

export default userService;
