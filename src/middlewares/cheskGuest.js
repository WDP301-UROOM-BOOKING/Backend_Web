// src/middlewares/checkCustomer.js

const jwt = require("jsonwebtoken");

const checkGuest = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    // Không có token => tiếp tục xử lý (không kiểm tra role)
    return next();
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    if (decoded.user.role !== "CUSTOMER")
      return res.status(403).json({ message: "Access denied" });

    req.user = decoded.user;
    next();
  });
};

module.exports = checkGuest;
