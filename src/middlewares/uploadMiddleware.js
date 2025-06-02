const express = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📂 Saving file to: uploads/");
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + '-' + file.originalname;
    console.log("📝 Saving file as:", filename);
    cb(null, filename);
  },
});

const upload = multer({ storage });


module.exports = upload;