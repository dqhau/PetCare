import axios from 'axios';

// Tạo một instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: 'http://localhost:9999',
});

// Thêm interceptor để tự động thêm token vào header của mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi response
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Có thể thêm logic để refresh token hoặc đăng xuất người dùng
      console.log('Token hết hạn hoặc không hợp lệ');
      // Chuyển hướng đến trang đăng nhập
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
