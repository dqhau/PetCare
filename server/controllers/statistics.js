import statisticsService from "../services/statisticsService.js";

// Thống kê tổng quan
const getBasicStats = async (req, res) => {
  try {
    const stats = await statisticsService.getBasicStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getBasicStats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Thống kê người dùng mới theo tháng
const getUserStatsByMonth = async (req, res) => {
  try {
    const monthlyData = await statisticsService.getUserStatsByMonth();
    const currentYear = new Date().getFullYear();
    res.status(200).json({
      year: currentYear,
      data: monthlyData
    });
  } catch (error) {
    console.error('Error in getUserStatsByMonth:', error);
    res.status(500).json({ message: error.message });
  }
};

// Thống kê thú cưng mới theo tháng
const getPetStatsByMonth = async (req, res) => {
  try {
    const monthlyData = await statisticsService.getPetStatsByMonth();
    const currentYear = new Date().getFullYear();
    res.status(200).json({
      year: currentYear,
      data: monthlyData
    });
  } catch (error) {
    console.error('Error in getPetStatsByMonth:', error);
    res.status(500).json({ message: error.message });
  }
};

// Thống kê đặt dịch vụ theo tháng
const getBookingStatsByMonth = async (req, res) => {
  try {
    const monthlyData = await statisticsService.getBookingStatsByMonth();
    const currentYear = new Date().getFullYear();
    res.status(200).json({
      year: currentYear,
      data: monthlyData
    });
  } catch (error) {
    console.error('Error in getBookingStatsByMonth:', error);
    res.status(500).json({ message: error.message });
  }
};

// Thống kê dịch vụ được đặt nhiều nhất
const getTopServices = async (req, res) => {
  try {
    console.log('Getting top services...');
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const topServices = await statisticsService.getTopServices(limit);
    console.log('Top services result:', topServices);
    res.status(200).json(topServices);
  } catch (error) {
    console.error('Error in getTopServices:', error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getBasicStats,
  getUserStatsByMonth,
  getPetStatsByMonth,
  getBookingStatsByMonth,
  getTopServices
};
