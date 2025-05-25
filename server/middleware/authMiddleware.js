import jwt from "jsonwebtoken";
import createError from "http-errors";

/**
 * Ký access token cho người dùng
 * @param {string} userId - ID của người dùng
 * @returns {Promise<string>} Token đã ký
 */
export const signAccessToken = (userId, role = 'user') => {
  return new Promise((resolve, reject) => {
    const payload = { user: { id: userId, role } };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: "24h", // Tăng từ 1h lên 24h
      issuer: "localhost:9999",
      audience: userId.toString(),
    };
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
      }
      resolve(token);
    });
  });
};

/**
 * Ký refresh token cho người dùng
 * @param {string} userId - ID của người dùng
 * @returns {Promise<string>} Token đã ký
 */
export const signRefreshToken = (userId, role = 'user') => {
  return new Promise((resolve, reject) => {
    const payload = { user: { id: userId, role } };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: "1y",
      issuer: "localhost:9999",
      audience: userId.toString(),
    };
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
      }
      resolve(token);
    });
  });
};

/**
 * Xác thực refresh token
 * @param {string} refreshToken - Refresh token cần xác thực
 * @returns {Promise<string>} userId của token
 */
export const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) return reject(createError.Unauthorized());
        const userId = payload.aud;
        resolve(userId);
      }
    );
  });
};

/**
 * Middleware xác thực access token
 * Kiểm tra token trong header Authorization
 * Nếu hợp lệ, thêm thông tin vào req.payload
 */
export const verifyAccessToken = (req, res, next) => {
  try {
    // Kiểm tra header Authorization
    if (!req.headers["authorization"]) {
      return next(createError(401, "Bạn chưa đăng nhập hoặc phiên đã hết hạn"));
    }

    // Lấy token từ header
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];

    // Xác thực token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Token không hợp lệ" : 
          err.name === "TokenExpiredError" ? "Token đã hết hạn" : 
          err.message;
        return next(createError(401, message));
      }
      
      // Thêm payload vào request (giống với jwt_helper.js)
      req.payload = payload;
      next();
    });
  } catch (error) {
    return next(createError(500, "Lỗi xử lý xác thực: " + error.message));
  }
};

/**
 * Middleware kiểm tra quyền admin
 * Phải sử dụng sau middleware verifyToken
 */
export const isAdmin = (req, res, next) => {
  try {
    if (!req.payload) {
      return next(createError(401, "Bạn chưa đăng nhập"));
    }
    
    // Kiểm tra role từ payload
    const role = req.payload.user?.role;
    if (role !== "admin") {
      return next(createError(403, "Bạn không có quyền truy cập"));
    }
    
    next();
  } catch (error) {
    return next(createError(500, "Lỗi xử lý quyền truy cập: " + error.message));
  }
};

/**
 * Middleware kiểm tra quyền chủ sở hữu tài nguyên
 * Dùng để kiểm tra người dùng có quyền truy cập vào tài nguyên của họ không
 */
export const isResourceOwner = (req, res, next) => {
  try {
    if (!req.payload) {
      return next(createError(401, "Bạn chưa đăng nhập"));
    }
    
    // Kiểm tra userId trong params có khớp với id của user đã đăng nhập không
    const requestedUserId = req.params.userId;
    const userId = req.payload.aud; // audience chứa userId trong jwt_helper.js
    
    if (requestedUserId && userId !== requestedUserId) {
      return next(createError(403, "Bạn không có quyền truy cập tài nguyên này"));
    }
    
    next();
  } catch (error) {
    return next(createError(500, "Lỗi xử lý quyền truy cập: " + error.message));
  }
};
