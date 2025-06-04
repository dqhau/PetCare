import statisticsService from "../services/statistics.js";

/**
 * Thống kê tổng quan cho dashboard admin
 * Bao gồm thống kê người dùng, thú cưng, đặt lịch và doanh thu
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.startDate] - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} [req.query.endDate] - Ngày kết thúc (YYYY-MM-DD)
 */
const getBasicStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Chuyển chuỗi ngày thành đối tượng Date nếu có
    let dateFilter = {};
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00
      dateFilter.start = start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Đặt thời gian về 23:59:59
      dateFilter.end = end;
    }
    
    const stats = await statisticsService.getBasicStats(dateFilter);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getBasicStats controller:', error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getBasicStats
};
