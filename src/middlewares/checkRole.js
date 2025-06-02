const jwt = require("jsonwebtoken");
const checkRole = (roles) => async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decoded.user;
    console.log("Decoded user:", req.user.role, roles);
    console.log("Decoded user:", roles.includes(req.user.role));
    if (
      roles.length > 0 &&
      (!req.user.role || !roles.includes(req.user.role))
    ) {
      console.log("Check role error???");
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  });
};

module.exports = checkRole;
