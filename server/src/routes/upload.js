import express from 'express';
import { uploadCloud} from '../configs/cloudinary.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';

const uploadRouter = express.Router();

// Upload ảnh sử dụng multer middleware
uploadRouter.post('/image', verifyAccessToken, uploadCloud.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file nào được tải lên' });
    }
    
    // Trả về thông tin ảnh đã tải lên
    res.status(200).json({
      url: req.file.path,
      publicId: req.file.filename,
      message: 'Tải ảnh lên thành công'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Không thể tải ảnh lên' });
  }
});

export default uploadRouter;
