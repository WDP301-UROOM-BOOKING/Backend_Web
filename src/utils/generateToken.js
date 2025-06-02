const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ user }, process.env.SECRET_KEY, {
    expiresIn: "1y",
    issuer: process.env.ISSUER,
  });
};

module.exports = generateToken;
