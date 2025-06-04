import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import userService from '../services/user.js';
import User from "../models/user.js";
import { sendEmail } from '../helpers/email.js';
import bcrypt from 'bcrypt';

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
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || "Lỗi cập nhật người dùng",
    });
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

/**
 * Chỉnh sửa thông tin người dùng theo ID
 */
const editUser = async (req, res) => {
  try {
    const user = await userService.editUserById(req.params.id, req.body);
    res.status(200).json({ message: "Edit user successfully" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Edit user failed" });
  }
};

/**
 * Xử lý quên mật khẩu
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.handleForgotPassword(email);
    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error sending password reset email" });
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
      return res.status(400).json({ status: false, message: "Thiếu thông tin yêu cầu" });
    }

    const result = await userService.changePassword(username, oldPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ 
      status: false, 
      message: error.message || "Lỗi thay đổi mật khẩu" 
    });
  }
};

/**
 * Xóa người dùng
 */
const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ 
      status: false, 
      message: error.message || "Lỗi xóa người dùng" 
    });
  }
};

export default {
  getAllUsers,
  editUser,
  changePass,
  updateUser,
  getUserByUserName,
  deleteUser,
  forgotPassword
};
