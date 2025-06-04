import Notification from '../models/notification.js';

/**
 * Dịch vụ xử lý logic liên quan đến thông báo
 */
const notificationService = {
  /**
   * Lấy tất cả thông báo cho admin
   * @returns {Promise<Array>} Danh sách thông báo
   */
  async getAllNotifications() {
    return await Notification.find({ userId: null })
      .sort({ createdAt: -1 })
      .populate({
        path: "relatedId",
        select: "customer_name phone_number appointment_date order_status"
      });
  },

  /**
   * Lấy thông báo theo userId
   * @param {string} userId - ID người dùng
   * @returns {Promise<Array>} Danh sách thông báo của người dùng
   */
  async getNotificationsByUserId(userId) {
    return await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "relatedId",
        select: "customer_name phone_number appointment_date order_status"
      });
  },

  /**
   * Lấy thông tin một thông báo theo ID
   * @param {string} id - ID thông báo
   * @returns {Promise<Object>} Thông tin thông báo
   */
  async getNotificationById(id) {
    return await Notification.findById(id);
  },

  /**
   * Đánh dấu thông báo đã đọc
   * @param {string} id - ID thông báo
   * @returns {Promise<Object>} Thông báo đã cập nhật
   */
  async markAsRead(id) {
    return await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
  },

  /**
   * Đánh dấu tất cả thông báo của admin đã đọc
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async markAllAsRead() {
    return await Notification.updateMany({ userId: null }, { isRead: true });
  },

  /**
   * Đánh dấu tất cả thông báo của một người dùng đã đọc
   * @param {string} userId - ID người dùng
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async markAllAsReadForUser(userId) {
    return await Notification.updateMany({ userId }, { isRead: true });
  },

  /**
   * Lấy số lượng thông báo chưa đọc của admin
   * @returns {Promise<Number>} Số lượng thông báo chưa đọc
   */
  async getUnreadCount() {
    return await Notification.countDocuments({ userId: null, isRead: false });
  },

  /**
   * Lấy số lượng thông báo chưa đọc của một người dùng
   * @param {string} userId - ID người dùng
   * @returns {Promise<Number>} Số lượng thông báo chưa đọc
   */
  async getUnreadCountForUser(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  },

  /**
   * Tạo thông báo mới
   * @param {Object} notificationData - Dữ liệu thông báo
   * @returns {Promise<Object>} Thông báo mới đã tạo
   */
  async createNotification(notificationData) {
    const notification = new Notification(notificationData);
    return await notification.save();
  }
};

export default notificationService;
