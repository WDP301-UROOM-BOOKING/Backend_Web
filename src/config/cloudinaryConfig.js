const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Debug config
console.log("=== CLOUDINARY CONFIG DEBUG ===");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

// Test cloudinary object
console.log("Cloudinary uploader available:", typeof cloudinary.uploader !== 'undefined' ? "✓" : "✗");
console.log("=== END CLOUDINARY CONFIG DEBUG ===");

module.exports = cloudinary;