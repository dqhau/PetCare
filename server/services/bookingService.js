import Booking from "../models/booking.js";
import Timeslot from "../models/timeslot.js";
import User from "../models/user.js";
import VaccinationHistory from "../models/VaccinationHistory.js";
import createError from "http-errors";

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
   * Tổng tiền theo từng loại dịch vụ
   * @returns {Promise<Object>} Tổng tiền theo từng loại dịch vụ
   */
  async getRevenueByServiceType() {
    try {
      const completedBookings = await Booking.find({ order_status: "Completed" })
        .populate("service_type")
        .exec();
      
      const revenueByServiceType = completedBookings.reduce(
        (accumulator, booking) => {
          const serviceName = booking.service_type.name;
          const servicePrice = booking.service_type.price;

          if (!accumulator[serviceName]) {
            accumulator[serviceName] = 0;
          }

          accumulator[serviceName] += servicePrice;
          return accumulator;
        },
        {}
      );

      return revenueByServiceType;
    } catch (error) {
      throw new Error(error.toString());
    }
  },

  /**
   * Lấy số lượng giống đực và cái làm dịch vụ
   * @returns {Promise<Object>} Số lượng giống đực và cái
   */
  async getPetBreeds() {
    try {
      const bookings = await Booking.find({ order_status: { $ne: "Cancel" } })
        .populate({
          path: "petId",
          select: "gender"
        })
        .exec();

      let maleCount = 0;
      let femaleCount = 0;

      bookings.forEach(booking => {
        if (booking.petId && booking.petId.gender) {
          if (booking.petId.gender === "Đực") {
            maleCount++;
          } else if (booking.petId.gender === "Cái") {
            femaleCount++;
          }
        }
      });

      return { maleCount, femaleCount };
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
      console.log('bookingService.getBookingsByUser called with userId:', userId);
      
      // Kiểm tra xem userId có đúng định dạng ObjectId không
      console.log('userId type:', typeof userId);
      
      const bookings = await Booking.find({ userId })
        .populate("service_type")
        .populate("petId")
        .populate("timeslot")
        .sort({ appointment_date: -1 })
        .exec();
      
      console.log(`Found ${bookings.length} bookings for userId ${userId}`);
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

      return this.processBookingData(booking);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xử lý dữ liệu booking trước khi trả về cho client
   * @param {Object} booking - Booking object từ database
   * @returns {Object} Booking object đã xử lý
   */
  processBookingData(booking) {
    try {
      // Chuyển đổi Mongoose document thành plain object
      const bookingData = booking.toObject ? booking.toObject() : booking;
      
      // Đảm bảo các trường cần thiết có sẵn
      return {
        ...bookingData,
        order_status: bookingData.order_status || 'Pending',
        service_type: bookingData.service_type || { name: 'Không có thông tin' },
        timeslot: bookingData.timeslot || { time: 'Không có thông tin' },
        petId: bookingData.petId || { name: 'Không có thông tin' }
      };
    } catch (error) {
      console.error('Error processing booking data:', error);
      throw new Error('Lỗi xử lý dữ liệu booking: ' + error.message);
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
      console.log('bookingService.createBooking called with data:', {
        userId: bookingData.userId,
        service_type: bookingData.service_type,
        customer_name: bookingData.customer_name
      });
      
      const newBooking = new Booking(bookingData);
      console.log('New booking model created with userId:', newBooking.userId);
      
      const savedBooking = await newBooking.save();
      console.log('Booking saved with ID:', savedBooking._id, 'and userId:', savedBooking.userId);
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
  }
};

export default bookingService;
