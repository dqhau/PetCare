/**
 * Tập trung các API services cho ứng dụng PetCare
 * File này chứa các hàm gọi API được tổ chức theo từng module
 */

import axiosInstance from './axiosConfig';

// ===== USER SERVICES =====
export const userService = {
  /**
   * Lấy thông tin người dùng theo username
   * @param {string} username - Username của người dùng
   * @returns {Promise<Object>} Thông tin người dùng
   */
  getUserByUsername: (username) => {
    return axiosInstance.get(`/users/${username}`);
  },
  
  /**
   * Đăng nhập người dùng
   * @param {Object} data - Dữ liệu đăng nhập {username, password}
   * @returns {Promise<Object>} Kết quả đăng nhập
   */
  login: (data) => {
    return axiosInstance.post("/users/login", data, {
      skipAuthRefresh: true
    });
  },
  
  /**
   * Đăng ký người dùng mới
   * @param {Object} data - Dữ liệu đăng ký
   * @returns {Promise<Object>} Kết quả đăng ký
   */
  register: (data) => {
    return axiosInstance.post("/users/register", data);
  },
  
  /**
   * Cập nhật thông tin người dùng
   * @param {string} username - Username của người dùng
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updateUser: (username, data) => {
    return axiosInstance.put(`/users/${username}`, data);
  },
  
  /**
   * Yêu cầu đặt lại mật khẩu
   * @param {Object} data - Dữ liệu yêu cầu {email}
   * @returns {Promise<Object>} Kết quả yêu cầu
   */
  forgotPassword: (data) => {
    return axiosInstance.post("/users/forgot-password", data);
  },
  
  /**
   * Đặt lại mật khẩu
   * @param {Object} data - Dữ liệu đặt lại {token, password}
   * @returns {Promise<Object>} Kết quả đặt lại
   */
  resetPassword: (data) => {
    return axiosInstance.post("/users/reset-password", data);
  },
  
  /**
   * Đổi mật khẩu
   * @param {Object} data - Dữ liệu đổi mật khẩu {oldPassword, newPassword}
   * @returns {Promise<Object>} Kết quả đổi mật khẩu
   */
  changePassword: (data) => {
    return axiosInstance.post("/users/change-password", data);
  },
};

// ===== PET SERVICES =====
export const petService = {
  /**
   * Lấy danh sách thú cưng của người dùng
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Object>} Danh sách thú cưng
   */
  getPetsByUserId: (userId) => {
    return axiosInstance.get(`/pets/user/${userId}`);
  },
  
  /**
   * Lấy thông tin chi tiết thú cưng
   * @param {string} petId - ID của thú cưng
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Object>} Thông tin thú cưng
   */
  getPetById: (petId, userId) => {
    return axiosInstance.get(`/pets/${petId}?userId=${userId}`);
  },
  
  /**
   * Thêm thú cưng mới
   * @param {Object} data - Dữ liệu thú cưng
   * @returns {Promise<Object>} Kết quả thêm thú cưng
   */
  addPet: (data) => {
    return axiosInstance.post("/pets", data);
  },
  
  /**
   * Cập nhật thông tin thú cưng
   * @param {string} petId - ID của thú cưng
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updatePet: (petId, data) => {
    return axiosInstance.put(`/pets/${petId}`, data);
  },
  
  /**
   * Xóa thú cưng
   * @param {string} petId - ID của thú cưng
   * @returns {Promise<Object>} Kết quả xóa
   */
  deletePet: (petId) => {
    return axiosInstance.delete(`/pets/${petId}`);
  },
};

// ===== BOOKING SERVICES =====
export const bookingService = {
  /**
   * Lấy danh sách đặt lịch của người dùng
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Object>} Danh sách đặt lịch
   */
  getBookingsByUserId: (userId) => {
    return axiosInstance.get(`/booking/user/${userId}`);
  },
  
  /**
   * Lấy lịch sử đặt lịch của người dùng
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Object>} Lịch sử đặt lịch
   */
  getBookingHistoryByUserId: (userId) => {
    return axiosInstance.get(`/booking/history/${userId}`);
  },
  
  /**
   * Lấy chi tiết đặt lịch
   * @param {string} bookingId - ID của đặt lịch
   * @returns {Promise<Object>} Chi tiết đặt lịch
   */
  getBookingById: (bookingId) => {
    return axiosInstance.get(`/booking/detail/${bookingId}`);
  },
  
  /**
   * Tạo đặt lịch mới
   * @param {Object} data - Dữ liệu đặt lịch
   * @returns {Promise<Object>} Kết quả đặt lịch
   */
  createBooking: (data) => {
    return axiosInstance.post("/booking", data);
  },
  
  /**
   * Cập nhật trạng thái đặt lịch
   * @param {string} bookingId - ID của đặt lịch
   * @param {Object} data - Dữ liệu cập nhật trạng thái
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updateBookingStatus: (bookingId, data) => {
    return axiosInstance.put(`/booking/update-status-with-history/${bookingId}`, data);
  },
};

// ===== SERVICE CATEGORIES =====
export const serviceService = {
  /**
   * Lấy danh sách loại dịch vụ
   * @returns {Promise<Object>} Danh sách loại dịch vụ
   */
  getServiceCategories: () => {
    return axiosInstance.get('/service/categories');
  },
  
  /**
   * Lấy danh sách dịch vụ
   * @returns {Promise<Object>} Danh sách dịch vụ
   */
  getAllServices: () => {
    return axiosInstance.get('/service');
  },
  
  /**
   * Lấy chi tiết dịch vụ
   * @param {string} serviceId - ID của dịch vụ
   * @returns {Promise<Object>} Chi tiết dịch vụ
   */
  getServiceById: (serviceId) => {
    return axiosInstance.get(`/service/${serviceId}`);
  },
};

// ===== TIMESLOT SERVICES =====
export const timeslotService = {
  /**
   * Lấy danh sách khung giờ
   * @returns {Promise<Object>} Danh sách khung giờ
   */
  getAllTimeSlots: () => {
    return axiosInstance.get('/timeslots');
  },
};

// ===== VACCINATION SERVICES =====
export const vaccinationService = {
  /**
   * Lấy lịch sử tiêm chủng của người dùng
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Object>} Lịch sử tiêm chủng
   */
  getVaccinationHistoryByUserId: (userId) => {
    return axiosInstance.get(`/users/vacxin/${userId}`);
  },
  
  /**
   * Lấy lịch sử tiêm chủng của thú cưng
   * @param {string} petId - ID của thú cưng
   * @returns {Promise<Object>} Lịch sử tiêm chủng
   */
  getVaccinationHistoryByPetId: (petId) => {
    return axiosInstance.get(`/vaccination/pet/${petId}`);
  },
  
  /**
   * Lấy tất cả lịch sử tiêm chủng
   * @returns {Promise<Object>} Tất cả lịch sử tiêm chủng
   */
  getAllVaccinations: () => {
    return axiosInstance.get('/vaccination');
  },
};

// ===== NOTIFICATION SERVICES =====
export const notificationService = {
  /**
   * Lấy tất cả thông báo
   * @returns {Promise<Object>} Danh sách thông báo
   */
  getAllNotifications: () => {
    return axiosInstance.get('/notifications');
  },
  
  /**
   * Đánh dấu thông báo đã đọc
   * @param {string} notificationId - ID của thông báo
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  markAsRead: (notificationId) => {
    return axiosInstance.put(`/notifications/${notificationId}/read`, {});
  },
  
  /**
   * Đánh dấu tất cả thông báo đã đọc
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  markAllAsRead: () => {
    return axiosInstance.put('/notifications/read-all', {});
  },
};

// ===== UPLOAD SERVICES =====
export const uploadService = {
  /**
   * Upload ảnh lên Cloudinary
   * @param {File} file - File ảnh cần upload
   * @returns {Promise<Object>} Kết quả upload
   */
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    
    return axiosInstance.post(
      "/upload/image",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  },
};
