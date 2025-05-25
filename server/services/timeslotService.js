import Timeslot from "../models/timeslot.js";

/**
 * Dịch vụ xử lý logic liên quan đến timeslot
 */
const timeslotService = {
  /**
   * Lấy tất cả các timeslot
   * @returns {Promise<Array>} Danh sách timeslot
   */
  async getAllTimeslots() {
    try {
      return await Timeslot.find({}).exec();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo timeslot mới
   * @param {Object} timeslotData - Dữ liệu timeslot mới
   * @returns {Promise<Object>} Timeslot đã tạo
   */
  async createTimeslot(timeslotData) {
    try {
      const newTimeslot = new Timeslot(timeslotData);
      return await newTimeslot.save();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật timeslot
   * @param {string} id - ID của timeslot
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Timeslot đã cập nhật
   */
  async updateTimeslot(id, updateData) {
    try {
      return await Timeslot.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa timeslot
   * @param {string} id - ID của timeslot
   * @returns {Promise<Object>} Timeslot đã xóa
   */
  async deleteTimeslot(id) {
    try {
      return await Timeslot.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy timeslot theo ID
   * @param {string} id - ID của timeslot
   * @returns {Promise<Object>} Timeslot
   */
  async getTimeslotById(id) {
    try {
      return await Timeslot.findById(id);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy timeslot theo thời gian
   * @param {string} time - Thời gian (format: HH:mm)
   * @returns {Promise<Object>} Timeslot
   */
  async getTimeslotByTime(time) {
    try {
      return await Timeslot.findOne({ time });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái đặt lịch của timeslot
   * @param {string} id - ID của timeslot
   * @param {boolean} isBooked - Trạng thái đặt lịch
   * @returns {Promise<Object>} Timeslot đã cập nhật
   */
  async updateBookingStatus(id, isBooked) {
    try {
      return await Timeslot.findByIdAndUpdate(
        id,
        { isBooked },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  },

  /**
   * Giảm số lượng slot còn trống
   * @param {string} id - ID của timeslot
   * @returns {Promise<Object>} Timeslot đã cập nhật
   */
  async decrementAvailableSlots(id) {
    try {
      return await Timeslot.findByIdAndUpdate(
        id,
        { $inc: { availableSlots: -1 } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tăng số lượng slot còn trống
   * @param {string} id - ID của timeslot
   * @returns {Promise<Object>} Timeslot đã cập nhật
   */
  async incrementAvailableSlots(id) {
    try {
      return await Timeslot.findByIdAndUpdate(
        id,
        { $inc: { availableSlots: 1 } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }
};

export default timeslotService;
