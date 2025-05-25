import Booking from "../models/booking.js";
import Service from "../models/service.js";
import User from "../models/user.js";
import Pet from "../models/pet.js";

/**
 * Dịch vụ xử lý logic liên quan đến thống kê
 */
const statisticsService = {
  /**
   * Lấy thống kê tổng quan cho dashboard admin
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
      
      // Đếm số lượng đặt lịch theo trạng thái
      const pendingBookings = await Booking.countDocuments({ order_status: "Pending" });
      const processingBookings = await Booking.countDocuments({ order_status: "Processing" });
      const completedBookings = await Booking.countDocuments({ order_status: "Completed" });
      const cancelledBookings = await Booking.countDocuments({ order_status: "Cancel" });
      
      // Tính tổng doanh thu từ các đơn đã hoàn thành
      const completedBookingsWithService = await Booking.find({ order_status: "Completed" })
        .populate('service_type')
        .exec();
      
      const totalRevenue = completedBookingsWithService.reduce((total, booking) => {
        if (booking.service_type && booking.service_type.price) {
          return total + booking.service_type.price;
        }
        return total;
      }, 0);
      
      // Lấy top 5 dịch vụ được đặt nhiều nhất
      const bookings = await Booking.find({}).populate('service_type').exec();
      const serviceCounts = {};
      
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
      
      const servicesArray = Object.values(serviceCounts);
      servicesArray.sort((a, b) => b.count - a.count);
      const topServices = servicesArray.slice(0, 5);
      
      return {
        totalUsers,
        totalPets,
        totalBookings,
        totalServices,
        bookingsByStatus: {
          pending: pendingBookings,
          processing: processingBookings,
          completed: completedBookings,
          cancelled: cancelledBookings
        },
        totalRevenue,
        topServices
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

export default statisticsService;
