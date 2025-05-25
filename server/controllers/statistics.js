import statisticsService from "../services/statisticsService.js";

/**
 * Thống kê tổng quan cho dashboard admin
 * Bao gồm thống kê người dùng, thú cưng, đặt lịch và doanh thu
 */
const getBasicStats = async (req, res) => {
  try {
    const stats = await statisticsService.getBasicStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getBasicStats
};
