const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Engine Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `file-${uniqueSuffix}${ext}`);
  }
});

// File Filter (Images, Videos, Documents)
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|gif|webp|svg|mp4|webm|mov|avi|mkv|pdf|doc|docx|txt|csv|zip|rar|ppt|pptx|xls|xlsx/;
  const extName = allowedExts.test(path.extname(file.originalname).toLowerCase());

  if (extName) {
    return cb(null, true);
  }
  cb(new Error('File format not supported. Supported: Images, Videos, and Documents (PDF, DOC, TXT, etc.).'));
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter
});

// Single General File Upload (Image / Video / Document)
router.post('/file', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let fileType = 'document';
    if (/jpeg|jpg|png|gif|webp|svg/.test(ext)) {
      fileType = 'image';
    } else if (/mp4|webm|mov|avi|mkv/.test(ext)) {
      fileType = 'video';
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'File uploaded successfully!',
      url: fileUrl,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'File upload failed.' });
  }
});

// Backward compatible single image route
router.post('/image', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Image uploaded successfully!',
      url: fileUrl,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: 'image'
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Image upload failed.' });
  }
});

module.exports = router;
