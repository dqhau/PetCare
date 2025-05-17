import jwt from 'jsonwebtoken';

export const authenticate = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Không có quyền truy cập' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Token không hợp lệ' });
    }
  };
};