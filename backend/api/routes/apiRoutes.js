import { Router } from 'express';
import { learningProgress } from '../controllers/dbController.js';
import { loginUser, signUpUser } from '../controllers/dbController.js';
import { getUserData } from '../controllers/dbController.js';
import { uniqueUsername } from '../controllers/dbController.js';
import { uniqueEmail } from '../controllers/dbController.js';
import { updateUserDetails } from '../controllers/dbController.js';
import { updateUserPassword } from '../controllers/dbController.js';
import{processVideo}from '../controllers/modelController.js'
import multer from 'multer';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage setup to preserve original file extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = crypto.randomBytes(16).toString("hex") + ext;
    cb(null, uniqueName);
  }
});

// Configure multer with file size limits and file type validation
const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log(` File upload: ${file.originalname}, mimetype: ${file.mimetype}`);
    
    if (file.fieldname === 'image') {
      // Accept image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for image processing'), false);
      }
    } else if (file.fieldname === 'video') {
      // Accept video files
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for video processing'), false);
      }
    } else {
      cb(new Error('Unexpected field name'), false);
    }
  }
});

const router = Router();

// Logger middleware
router.use((req, res, next) => {
  console.log(` ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.file) {
    console.log(` File: ${req.file.originalname} (${req.file.size} bytes)`);
  }
  next();
});



//These are out api routes
router.get("/learning/progress/:username", learningProgress);
router.put("/learning/progress/:username", learningProgress);
router.post("/auth/signup", signUpUser);  // Add this new route
router.post("/auth/login", loginUser);
router.get("/user/:id", getUserData);
router.get("/auth/unique-username/:username", uniqueUsername);
router.get("/auth/unique-email/:email", uniqueEmail);
router.put('/user/:id/details', updateUserDetails);
router.put('/user/:id/password', updateUserPassword);

// AI Processing routes
router.post('/process-video', upload.single('video'), processVideo);


// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        details: 'Maximum file size is 50MB'
      });
    }
    return res.status(400).json({
      error: 'File upload error',
      details: error.message
    });
  }
  
  if (error.message.includes('Only image files') || error.message.includes('Only video files')) {
    return res.status(400).json({
      error: 'Invalid file type',
      details: error.message
    });
  }
  
  next(error);
});

export default router;