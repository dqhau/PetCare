import axiosInstance from './axiosConfig';

/**
 * Upload ảnh lên Cloudinary và trả về URL của ảnh
 * @param {File} file - File ảnh cần upload
 * @returns {Promise<string|null>} URL của ảnh đã upload hoặc null nếu có lỗi
 */
export const uploadImageToCloudinary = async (file) => {
  if (!file) return null;
  
  const formData = new FormData();
  formData.append("image", file);
  
  try {
    const response = await axiosInstance.post(
      "/upload/image",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    if (response.status === 200) {
      return response.data.url;
    }
    throw new Error("Upload ảnh thất bại");
  } catch (error) {
    console.error("Lỗi khi upload ảnh:", error);
    return null;
  }
};
