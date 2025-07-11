import Booking from "../models/booking.js";
import Timeslot from "../models/timeslot.js";
import User from "../models/user.js";
import createError from "http-errors";
import mongoose from "mongoose";

/**
 * Dịch vụ xử lý logic liên quan đến booking
 */
const bookingService = {
  /**
   * Lấy tổng số dịch vụ đã book
   * @returns {Promise<Number>} Tổng số dịch vụ đã book
   */
  async getTotalServices() {
    try {
      return await Booking.countDocuments({
        order_status: { $ne: "Cancel" },
      });
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Tính tổng tiền tất cả services ở trạng thái completed
   * @returns {Promise<Number>} Tổng tiền
   */
  async getRevenueServices() {
    try {
      const completedBookings = await Booking.find({ order_status: "Completed" })
        .populate("service_type")
        .exec();

      const totalAmount = completedBookings.reduce((total, booking) => {
        if (booking.service_type && booking.service_type.price) {
          return total + booking.service_type.price;
        }
        return total;
      }, 0);

      return totalAmount;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Lấy danh sách tất cả các booking theo user
   * @param {string} userId - ID người dùng
   * @returns {Promise<Array>} Danh sách booking
   */
  async getBookingsByUser(userId) {
    try {
      const bookings = await Booking.find({ userId })
        .populate("service_type")
        .populate("petId")
        .populate("timeslot")
        .sort({ appointment_date: -1 })
        .exec();
      return bookings;
    } catch (error) {
      console.error('Error in getBookingsByUser:', error);
      throw new Error(error.toString());
    }
  },

  /**
   * Lấy thông tin booking theo ID
   * @param {string} id - ID booking
   * @returns {Promise<Object>} Thông tin booking
   */
  async getBookingById(id) {
    try {
      const booking = await Booking.findById(id)
        .populate("service_type")
        .populate("petId")
        .populate("timeslot")
        .populate("userId", "username fullname email")
        .exec();

      if (!booking) {
        throw createError.NotFound("Không tìm thấy booking với ID đã cung cấp");
      }

      return booking;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy tổng số đặt lịch theo trạng thái
   * @returns {Promise<Object>} Tổng số đặt lịch theo trạng thái
   */
  async getBookingStatsByStatus() {
    try {
      const stats = {};
      const statusTypes = ["Pending", "Processing", "Completed", "Cancel"];

      for (const status of statusTypes) {
        const count = await Booking.countDocuments({ order_status: status });
        stats[status] = count;
      }

      const total = await Booking.countDocuments();
      stats.Total = total;

      return stats;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Lấy danh sách tất cả các booking
   * @returns {Promise<Array>} Danh sách booking
   */
  async getAllBookings() {
    try {
      return await Booking.find({})
        .populate("service_type")
        .populate("petId")
        .populate("timeslot")
        .populate("userId", "username fullname email")
        .sort({ appointment_date: -1 })
        .exec();
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Cập nhật trạng thái booking và lý do nếu chuyển thành 'cancel'
   * @param {string} id - ID booking
   * @param {string} status - Trạng thái mới
   * @param {string} cancel_reason - Lý do hủy (nếu có)
   * @returns {Promise<Object>} Booking đã cập nhật
   */
  async updateBookingStatus(id, status, cancel_reason) {
    try {
      // Kiểm tra booking có tồn tại không
      const booking = await Booking.findById(id);
      if (!booking) {
        throw createError.NotFound("Không tìm thấy booking với ID đã cung cấp");
      }

      // Cập nhật trạng thái
      const updateData = { order_status: status };
      
      // Nếu trạng thái là 'Cancel', cập nhật lý do hủy
      if (status === "Cancel" && cancel_reason) {
        updateData.cancel_reason = cancel_reason;
      }

      // Cập nhật booking
      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      )
        .populate("service_type")
        .populate("petId")
        .populate("timeslot")
        .exec();

      return updatedBooking;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách booking theo userId và trạng thái
   * @param {string} userId - ID người dùng
   * @param {string} status - Trạng thái
   * @returns {Promise<Array>} Danh sách booking
   */
  async getBookingsByUserAndStatus(userId, status) {
    try {
      const query = { userId };
      
      if (status && status !== "All") {
        query.order_status = status;
      }

      return await Booking.find(query)
        .populate("service_type")
        .populate("petId")
        .populate("timeslot")
        .sort({ appointment_date: -1 })
        .exec();
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Thêm booking mới
   * @param {Object} bookingData - Dữ liệu booking
   * @param {Object} timeslot - Timeslot
   * @returns {Promise<Object>} Booking mới
   */
  async createBooking(bookingData, timeslot) {
    try {
      const newBooking = new Booking(bookingData);
      const savedBooking = await newBooking.save();
      return savedBooking;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Sửa thông tin booking theo ID
   * @param {string} id - ID booking
   * @param {Object} bookingData - Dữ liệu booking
   * @returns {Promise<Object>} Booking đã cập nhật
   */
  async updateBooking(id, bookingData) {
    try {
      return await Booking.findByIdAndUpdate(id, bookingData, { new: true })
        .populate("service_type")
        .populate("petId")
        .populate("timeslot")
        .exec();
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Xóa booking theo ID
   * @param {string} id - ID booking
   * @returns {Promise<Object>} Kết quả xóa
   */
  async deleteBooking(id) {
    try {
      // Kiểm tra booking có tồn tại không
      const booking = await Booking.findById(id);
      if (!booking) {
        throw createError.NotFound("Không tìm thấy booking với ID đã cung cấp");
      }

      // Giải phóng timeslot
      if (booking.timeslot) {
        await Timeslot.findByIdAndUpdate(
          booking.timeslot,
          { isBooked: false },
          { new: true }
        );
      }

      // Xóa booking
      return await Booking.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái lịch với lịch sử tiêm chủng nếu cần
   * @param {string} id - ID booking
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Booking đã cập nhật
   */
  async updateBookingStatusWithHistory(id, updateData) {
    try {
      // Kiểm tra booking có tồn tại không
      const booking = await Booking.findById(id)
        .populate("service_type")
        .populate("petId")
        .exec();

      if (!booking) {
        throw createError.NotFound("Không tìm thấy booking với ID đã cung cấp");
      }

      // Nếu cập nhật thành 'Completed' và là dịch vụ tiêm chủng, tạo lịch sử tiêm chủng
      if (
        updateData.order_status === "Completed" &&
        booking.service_type &&
        booking.service_type.name.toLowerCase().includes("tiêm chủng")
      ) {
        // Động import VaccinationHistory model
        const VaccinationHistory = (await import('../models/VaccinationHistory.js')).default;
        
        // Kiểm tra xem đã có lịch sử tiêm chủng cho booking này chưa
        const existingHistory = await VaccinationHistory.findOne({
          bookingId: id
        });

        // Nếu chưa có, tạo mới lịch sử tiêm chủng
        if (!existingHistory) {
          const vaccinationData = {
            petId: booking.petId._id,
            userId: booking.userId,
            bookingId: booking._id,
            vaccineName: booking.service_type.name,
            vaccinationDate: new Date(),
            nextVaccinationDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
          };

          // Tạo mới lịch sử tiêm chủng
          const newVaccinationHistory = new VaccinationHistory(vaccinationData);
          await newVaccinationHistory.save();
        }
      }

      // Cập nhật booking
      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      )
        .populate("service_type")
        .populate("petId")
        .populate("timeslot")
        .exec();

      return updatedBooking;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Chuyển đổi timeslot cho booking
   * @param {string} id - ID booking
   * @param {string} newTimeslotId - ID timeslot mới
   * @returns {Promise<Object>} Booking đã cập nhật
   */
  async changeTimeslot(id, newTimeslotId) {
    try {
      // Kiểm tra booking có tồn tại không
      const booking = await Booking.findById(id);
      if (!booking) {
        throw createError.NotFound("Không tìm thấy booking với ID đã cung cấp");
      }

      // Kiểm tra timeslot mới có tồn tại không
      const newTimeslot = await Timeslot.findById(newTimeslotId);
      if (!newTimeslot) {
        throw createError.NotFound("Không tìm thấy timeslot mới với ID đã cung cấp");
      }

      // Kiểm tra timeslot mới đã được đặt chưa
      if (newTimeslot.isBooked) {
        throw createError.BadRequest("Timeslot này đã được đặt");
      }

      // Giải phóng timeslot cũ
      if (booking.timeslot) {
        await Timeslot.findByIdAndUpdate(
          booking.timeslot,
          { isBooked: false },
          { new: true }
        );
      }

      // Đặt timeslot mới
      await Timeslot.findByIdAndUpdate(
        newTimeslotId,
        { isBooked: true },
        { new: true }
      );

      // Cập nhật booking với timeslot mới
      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        { timeslot: newTimeslotId },
        { new: true }
      )
        .populate("service_type")
        .populate("petId")
        .populate("timeslot")
        .exec();

      return updatedBooking;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả các booking với bộ lọc
   * @param {Object} filters - Các điều kiện lọc
   * @param {string} filters.service_type - ID của dịch vụ cần lọc
   * @param {string} filters.status - Trạng thái booking cần lọc
   * @returns {Promise<Array>} Danh sách booking đã lọc
   */
  async getAllBookingsWithFilters(filters = {}) {
    try {
      const query = {};

      // Lọc theo trạng thái nếu có và khác 'All'
      if (filters.status && filters.status !== 'All') {
        query.order_status = filters.status;
      }

      // Lọc theo service_type nếu có và khác 'All'
      if (filters.service_type && filters.service_type !== 'All') {
        query.service_type = mongoose.Types.ObjectId(filters.service_type);
      }

      return await Booking.find(query)
        .populate("service_type")
        .populate("petId")
        .populate("timeslot")
        .populate("userId", "username fullname email")
        .sort({ appointment_date: -1 })
        .exec();
    } catch (error) {
      throw new Error(error.toString());
    }
  },


};

export default bookingService;
