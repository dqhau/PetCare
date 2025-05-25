import axios from 'axios';

const API_URL = 'http://localhost:9999';

<<<<<<< HEAD
/**
 * Upload avatar (hình ảnh đại diện) lên server
 * @param {File} file - File ảnh cần upload
 * @returns {Promise<string>} URL của ảnh đã upload
 */
export const uploadAvatar = async (file) => {
  // Kiểm tra xem có file được chọn không
  if (!file) {
    throw new Error('Vui lòng chọn file ảnh');
  }
  
  // Kiểm tra loại file (chỉ chấp nhận ảnh)
  if (!file.type.match('image.*')) {
    throw new Error('Vui lòng chọn file ảnh hợp lệ');
  }
  
  // Kiểm tra kích thước file (tối đa 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Ảnh quá lớn. Kích thước tối đa là 2MB');
  }
  
=======
// Hàm upload ảnh sử dụng FormData (cho file từ input)
export const uploadImage = async (file) => {
>>>>>>> 37b59e38b3e7f9b81d5a57ca12da94b2c3c5f2c5
  try {
    // Tạo form data
    const formData = new FormData();
    formData.append('image', file);

    // Gọi API upload
<<<<<<< HEAD
    const response = await axios.post(`${API_URL}/upload/avatar`, formData, {
=======
    const response = await axios.post(`${API_URL}/upload/image`, formData, {
>>>>>>> 37b59e38b3e7f9b81d5a57ca12da94b2c3c5f2c5
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

<<<<<<< HEAD
    // Trả về URL của ảnh
    return response.data.url;
  } catch (error) {
    console.error('Lỗi khi upload avatar:', error);
=======
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error.response?.data?.error || 'Không thể tải ảnh lên');
  }
};

// Hàm upload nhiều ảnh
export const uploadMultipleImages = async (files) => {
  try {
    // Tạo form data
    const formData = new FormData();
    
    // Thêm nhiều file vào form data
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    // Gọi API upload
    const response = await axios.post(`${API_URL}/upload/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
>>>>>>> 37b59e38b3e7f9b81d5a57ca12da94b2c3c5f2c5
    throw new Error(error.response?.data?.error || 'Không thể tải ảnh lên');
  }
};

// Hàm upload ảnh từ base64 string (cho ảnh từ canvas, cropper, etc.)
export const uploadBase64Image = async (base64Image) => {
  try {
    // Gọi API upload
    const response = await axios.post(`${API_URL}/upload/image/base64`, 
      { base64Image },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    throw new Error(error.response?.data?.error || 'Không thể tải ảnh lên');
  }
};

// Hàm xóa ảnh
export const deleteImage = async (publicId) => {
  try {
    // Gọi API xóa
    const response = await axios.delete(`${API_URL}/upload/image/${publicId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error(error.response?.data?.error || 'Không thể xóa ảnh');
  }
};
