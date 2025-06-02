const jwt = require("jsonwebtoken");

const isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log(err.message);
      return res.status(403).json({ message: "Invalid token" });
    }
    if (decoded.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, You don't have admin role" });
    }
    req.user = decoded.user;
    next();
  });
};

module.exports = { isAdmin };
