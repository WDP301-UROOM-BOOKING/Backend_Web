const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

// Test cloudinary object
console.log("Cloudinary uploader available:", typeof cloudinary.uploader !== 'undefined' ? "✓" : "✗");
console.log("=== END CLOUDINARY CONFIG DEBUG ===");

module.exports = cloudinary;