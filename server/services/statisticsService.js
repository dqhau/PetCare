import Booking from "../models/booking.js";
import Service from "../models/service.js";
import User from "../models/user.js";
import Pet from "../models/pet.js";

/**
 * Dịch vụ xử lý logic liên quan đến thống kê
 */
const statisticsService = {
  /**
   * Lấy thống kê tổng quan
   * @returns {Promise<Object>} Thống kê tổng quan
   */
  async getBasicStats() {
    try {
      // Đếm số lượng người dùng
      const totalUsers = await User.countDocuments({ role: "user" });
      
      // Đếm tổng số thú cưng
      const totalPets = await Pet.countDocuments();
      
      // Đếm tổng số đặt lịch
      const totalBookings = await Booking.countDocuments();
      
      // Đếm số lượng dịch vụ
      const totalServices = await Service.countDocuments();
      
      return {
        totalUsers,
        totalPets,
        totalBookings,
        totalServices
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Thống kê người dùng mới theo tháng
   * @returns {Promise<Array>} Thống kê người dùng theo tháng
   */
  async getUserStatsByMonth() {
    try {
      const currentYear = new Date().getFullYear();
      const stats = await User.aggregate([
        {
          $match: {
            role: "user",
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`)
            }
          }
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.month": 1 }
        }
      ]);
      
      // Chuẩn bị dữ liệu cho 12 tháng
      const monthlyData = Array(12).fill(0);
      
      // Điền dữ liệu thực tế vào mảng
      stats.forEach(item => {
        const monthIndex = item._id.month - 1; // Trừ 1 vì mảng bắt đầu từ 0
        monthlyData[monthIndex] = item.count;
      });
      
      return monthlyData;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Thống kê thú cưng mới theo tháng
   * @returns {Promise<Array>} Thống kê thú cưng theo tháng
   */
  async getPetStatsByMonth() {
    try {
      const currentYear = new Date().getFullYear();
      const stats = await Pet.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`)
            }
          }
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.month": 1 }
        }
      ]);
      
      // Chuẩn bị dữ liệu cho 12 tháng
      const monthlyData = Array(12).fill(0);
      
      // Điền dữ liệu thực tế vào mảng
      stats.forEach(item => {
        const monthIndex = item._id.month - 1; // Trừ 1 vì mảng bắt đầu từ 0
        monthlyData[monthIndex] = item.count;
      });
      
      return monthlyData;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Thống kê đặt dịch vụ theo tháng
   * @returns {Promise<Array>} Thống kê đặt dịch vụ theo tháng
   */
  async getBookingStatsByMonth() {
    try {
      const currentYear = new Date().getFullYear();
      const stats = await Booking.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`)
            }
          }
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.month": 1 }
        }
      ]);
      
      // Chuẩn bị dữ liệu cho 12 tháng
      const monthlyData = Array(12).fill(0);
      
      // Điền dữ liệu thực tế vào mảng
      stats.forEach(item => {
        const monthIndex = item._id.month - 1; // Trừ 1 vì mảng bắt đầu từ 0
        monthlyData[monthIndex] = item.count;
      });
      
      return monthlyData;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Thống kê dịch vụ được đặt nhiều nhất
   * @param {number} limit - Giới hạn số lượng
   * @returns {Promise<Array>} Danh sách dịch vụ được đặt nhiều nhất
   */
  async getTopServices(limit = 5) {
    try {
      // Lấy tất cả đặt lịch
      const bookings = await Booking.find({}).populate('service_type').exec();
      
      // Tạo một bảng băm để đếm số lần dịch vụ được đặt
      const serviceCounts = {};
      
      // Đếm số lần mỗi dịch vụ được đặt
      bookings.forEach(booking => {
        if (booking.service_type) {
          const serviceId = booking.service_type._id.toString();
          const serviceName = booking.service_type.name;
          
          if (!serviceCounts[serviceId]) {
            serviceCounts[serviceId] = {
              name: serviceName,
              count: 0
            };
          }
          
          serviceCounts[serviceId].count += 1;
        }
      });
      
      // Chuyển đổi bảng băm thành mảng
      const servicesArray = Object.values(serviceCounts);
      
      // Sắp xếp theo thứ tự giảm dần
      servicesArray.sort((a, b) => b.count - a.count);
      
      // Giới hạn số lượng kết quả
      return servicesArray.slice(0, limit);
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

export default statisticsService;
