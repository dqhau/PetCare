import userService from '../services/user.js';
import { signAccessToken} from "../middleware/authMiddleware.js";
import jwt from 'jsonwebtoken';

/**
 * Controller xử lý chức năng xác thực (đăng ký, đăng nhập)
 */
const authController = {
  /**
   * Đăng ký người dùng mới
   */
  async register(req, res, next) {
    try {
      // Sử dụng service để xử lý đăng ký
      const savedUser = await userService.registerUser(req.body);
      
      // Tạo token truy cập với role
      const accessToken = await signAccessToken(savedUser._id, savedUser.role);
      
      // Trả về thông tin người dùng và token
      res.status(201).json({ 
        accessToken, 
        user: {
          id: savedUser._id,
          username: savedUser.username,
          fullname: savedUser.fullname,
          role: savedUser.role
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Đăng nhập người dùng
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      
      // Sử dụng service để kiểm tra đăng nhập
      const user = await userService.loginUser(username, password);
      
      // Tạo access token với role
      const accessToken = await signAccessToken(user._id, user.role);
      
      // Trả về thông tin người dùng và token
      res.status(200).json({
        username: user.username,
        accessToken,
        id: user._id,
        fullname: user.fullname,
        role: user.role,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(req, res) {
    try {
      const { id, token } = req.params;
      const { password } = req.body;
      
      // Kiểm tra token
      const jwtSecretKey = process.env.JWT_SECRET_KEY;
      jwt.verify(token, jwtSecretKey, async (err, decoded) => {
        if (err) {
          return res.status(401).json({ Status: "Error with token", Error: err.message });
        }
        
        try {
          // Cập nhật mật khẩu mới
          await userService.updatePassword(id, password);
          res.status(200).json({ Status: "Success" });
        } catch (error) {
          res.status(500).json({ Status: "Error", Error: error.message });
        }
      });
    } catch (error) {
      res.status(500).json({ Status: "Error", Error: error.message });
    }
  }
};

export default authController;
