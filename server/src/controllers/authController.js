const jwt = require('jsonwebtoken');
const { User } = require('../models');
const sendEmail = require('../services/emailService');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    const user = await User.create({
      email,
      password,
      verificationToken
    });

    // Gửi email xác thực
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Xác thực email',
      html: `Nhấn vào link để xác thực: <a href="${verificationUrl}">${verificationUrl}</a>`
    });

    res.status(201).json({ message: 'Registration successful. Please check your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    user.status = 'Active';
    user.verificationToken = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'Active') {
      return res.status(401).json({ message: 'Account not activated' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 900000; // 15 phút
    await user.save();

    // Gửi email reset mật khẩu
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Reset mật khẩu',
      html: `Nhấn vào link để đặt lại mật khẩu: <a href="${resetUrl}">${resetUrl}</a>`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword
};