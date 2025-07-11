import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from "dotenv";

dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình storage cho multer
const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
  params: {
    folder: 'petcare'
  }
});

// Tạo middleware upload
const uploadCloud = multer({ storage });

// Function to upload image
const uploadImage = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'petcare',
    });
    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export { uploadCloud, uploadImage, cloudinary };
