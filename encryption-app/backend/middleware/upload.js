const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow all file types for encryption
  const allowedMimes = [
    'text/plain',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Update allowedMimes to include more file types
// const allowedMimes = [
//   'text/plain',
//   'application/pdf',
//   'image/jpeg',
//   'image/png',
//   'image/gif',
//   'image/bmp',
//   'image/webp',
//   'application/msword',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   'application/vnd.ms-excel',
//   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//   'application/vnd.ms-powerpoint',
//   'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//   'application/zip',
//   'application/x-rar-compressed'
// ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only text, PDF, images, and documents are allowed.'), false);
  }
};



const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;