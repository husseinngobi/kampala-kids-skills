import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directories exist
const uploadDir = 'uploads';
const videoDir = 'uploads/videos';
const imageDir = 'uploads/images';
const documentDir = 'uploads/documents';

[uploadDir, videoDir, imageDir, documentDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else {
      uploadPath += 'documents/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Video files
  const videoMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // .avi
    'video/x-ms-wmv'   // .wmv
  ];

  // Image files
  const imageMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  // Document files
  const documentMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allowedMimes = [...videoMimes, ...imageMimes, ...documentMimes];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: fileFilter
});

// Export the base upload middleware
export { upload };

// Middleware for different file types
export const uploadVideo = upload.single('video');
export const uploadImage = upload.single('image');
export const uploadDocument = upload.single('document');
export const uploadMultiple = upload.array('files', 10);

// Helper function to delete file
export const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};