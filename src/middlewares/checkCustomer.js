// src/middlewares/checkCustomer.js

const jwt = require("jsonwebtoken");

const checkCustomer = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("token >> ", token)
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    if (decoded.user.role !== "CUSTOMER")
      return res.status(403).json({ message: "Access denied" });

    req.user = decoded.user;
    next();
  });
};

module.exports = checkCustomer;
