import createError from 'http-errors';

/**
 * Middleware để xác thực hình ảnh trước khi upload
 * - Kiểm tra loại file
 * - Kiểm tra kích thước file
 * - Kiểm tra số lượng file (cho upload nhiều)
 */
export const validateImage = (req, res, next) => {
  try {
    // Kiểm tra nếu không có file
    if (!req.file && (!req.files || req.files.length === 0)) {
      throw createError(400, 'Không có file nào được tải lên');
    }

    // Lấy danh sách file (một hoặc nhiều)
    const files = req.file ? [req.file] : req.files;
    
    // Các loại MIME hợp lệ cho hình ảnh
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    // Kích thước tối đa (5MB)
    const maxSize = 5 * 1024 * 1024;
    
    // Kiểm tra từng file
    for (const file of files) {
      // Kiểm tra loại file
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw createError(400, `File "${file.originalname}" không phải là hình ảnh hợp lệ. Chỉ chấp nhận JPEG, PNG, GIF và WEBP.`);
      }
      
      // Kiểm tra kích thước file
      if (file.size > maxSize) {
        throw createError(400, `File "${file.originalname}" vượt quá kích thước tối đa (5MB).`);
      }
    }
    
    // Nếu mọi thứ đều hợp lệ, tiếp tục
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware để kiểm tra quyền upload ảnh
 * - Kiểm tra xem người dùng có quyền upload không
 * - Kiểm tra giới hạn số lượng ảnh có thể upload
 */
export const checkUploadPermission = (req, res, next) => {
  try {
    // Lấy thông tin người dùng từ middleware xác thực trước đó
    const user = req.payload;
    
    if (!user) {
      throw createError(401, 'Không có quyền truy cập');
    }
    
    // Kiểm tra vai trò người dùng (nếu cần)
    // Ví dụ: chỉ admin và nhân viên mới có thể upload nhiều ảnh
    if (req.files && req.files.length > 5 && user.role !== 'admin' && user.role !== 'staff') {
      throw createError(403, 'Bạn không có quyền upload nhiều hơn 5 ảnh cùng lúc');
    }
    
    // Có thể thêm các kiểm tra khác như:
    // - Giới hạn số lượng ảnh mỗi ngày
    // - Giới hạn tổng dung lượng
    // - Kiểm tra xem người dùng có bị cấm không
    
    // Nếu mọi thứ đều hợp lệ, tiếp tục
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware để ghi log hoạt động upload
 */
export const logImageUpload = (req, res, next) => {
  // Lấy thông tin người dùng từ middleware xác thực
  const user = req.payload;
  
  // Ghi log thông tin upload
  console.log(`[${new Date().toISOString()}] User ${user?.id || 'unknown'} uploaded ${req.file ? '1 file' : `${req.files?.length || 0} files`}`);
  
  // Tiếp tục
  next();
};
