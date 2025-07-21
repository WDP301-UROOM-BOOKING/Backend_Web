const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Optional authentication middleware - không throw error nếu không có token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Không có token, tiếp tục mà không set user
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      if (!decoded.user) {
        req.user = null;
        return next();
      }

      // Cho phép cả CUSTOMER và ADMIN
      if (decoded.user.role === "CUSTOMER" || decoded.user.role === "ADMIN") {
        req.user = decoded.user;
      } else {
        req.user = null;
      }

      next();
    } catch (jwtError) {
      // Token không hợp lệ, tiếp tục mà không set user
      req.user = null;
      next();
    }
  } catch (error) {
    // Có lỗi gì đó, tiếp tục mà không set user
    req.user = null;
    next();
  }
};

module.exports = optionalAuth;
