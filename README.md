# PetCare - Hệ thống Quản lý và Đặt lịch Dịch vụ Thú cưng

## Giới thiệu
PetCare là một ứng dụng web fullstack cho phép người dùng quản lý thông tin thú cưng và đặt lịch các dịch vụ chăm sóc thú cưng như tắm, cắt tỉa lông, spa, v.v.

## Yêu cầu hệ thống
- Node.js (v14 trở lên)
- MongoDB (v4.4 trở lên)
- Git

## Cài đặt

### 1. Clone dự án
```bash
git clone https://github.com/dqhau/PetCare.git
cd PetCare
```

### 2. Cài đặt Backend (Server)
```bash
# Di chuyển vào thư mục server
cd server

# Cài đặt các dependencies
npm install

# Tạo file .env và cấu hình các biến môi trường
cp .env.example .env
```

Cấu hình file `.env` với các thông tin sau:
```env
PORT=9999
MONGODB_URI=mongodb://localhost:27017/petcare
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

### 3. Cài đặt Frontend (Client)
```bash
# Di chuyển vào thư mục client
cd ../client

# Cài đặt các dependencies
npm install

# Tạo file .env và cấu hình các biến môi trường
cp .env.example .env
```

Cấu hình file `.env` với các thông tin sau:
```env
REACT_APP_API_URL=http://localhost:9999
```

## Chạy ứng dụng

### 1. Chạy Backend
```bash
# Trong thư mục server
npm run dev
```
Server sẽ chạy tại http://localhost:9999

### 2. Chạy Frontend
```bash
# Trong thư mục client
npm start
```
Ứng dụng sẽ chạy tại http://localhost:3000

## Các tính năng chính

### Người dùng
- Đăng ký/Đăng nhập tài khoản
- Quản lý thông tin cá nhân
- Quản lý thú cưng (thêm, sửa, xóa)
- Đặt lịch dịch vụ
- Xem lịch sử đặt lịch
- Hủy đặt lịch

### Admin
- Quản lý người dùng
- Quản lý dịch vụ
- Quản lý đặt lịch
- Xem thống kê, báo cáo

## Công nghệ sử dụng

### Frontend
- React.js
- React Router DOM
- React Bootstrap & PrimeReact
- Axios
- React Icons
- React Toastify
- Chart.js

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Bcrypt
- Multer & Cloudinary
- Nodemailer

## Cấu trúc thư mục

### Frontend (client/)
```
src/
  ├── assets/      # Hình ảnh, fonts, etc.
  ├── components/  # React components
  ├── pages/       # Các trang chính
  ├── utils/       # Các hàm tiện ích
  ├── styles/      # CSS files
  └── App.js       # Component gốc
```

### Backend (server/)
```
src/
  ├── configs/     # Cấu hình
  ├── controllers/ # Xử lý logic
  ├── models/      # Schema MongoDB
  ├── routes/      # API endpoints
  ├── middleware/  # Middleware
  ├── services/    # Business logic
  └── helpers/     # Hàm tiện ích
```

## Đóng góp
Mọi đóng góp cho dự án đều được hoan nghênh. Vui lòng:
1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## Giấy phép
Dự án được phân phối dưới giấy phép ISC. Xem `LICENSE` để biết thêm thông tin.

## Liên hệ
Đào Quang Hậu - [@dqhau](https://github.com/dqhau)

Link dự án: [https://github.com/dqhau/PetCare](https://github.com/dqhau/PetCare) 