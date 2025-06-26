import { Router } from 'express';
import {
    learningProgress,
    loginUser,
    signUpUser,
    uniqueUsername,
    uniqueEmail,
    updateUserDetails,
    updateUserPassword,
    logoutUser,
    authenticateUser,
    getUserData,
    deleteUserAccount,
    uploadUserAvatar,
    resetPassword,
    confirmPasswordReset // Added from the first snippet
} from '../controllers/dbController.js';

import {
    testPython,
    processSign,
    processVideo, // Using processVideo from modelController.js as it's the AI processing one
    healthCheck
} from '../controllers/modelController.js';

import multer from 'multer';
// fs, crypto, path, fileURLToPath, __filename, __dirname, and uploadsDir are not needed
// when using multer.memoryStorage(), as files are not written to disk.
// import fs from 'fs';
// import crypto from 'crypto';
// import path from 'path';
// import { fileURLToPath } from 'url';

const router = Router();

// Multer storage setup to use memory storage
const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    // No 'files' property needed; Multer handles multiple files via array/any/fields methods
    fileFilter: (req, file, cb) => {
        console.log(` File upload: ${file.originalname}, mimetype: ${file.mimetype}`);

        // Handle 'image' or 'frames' field names for image files
        if (file.fieldname === 'image' || file.fieldname === 'frames') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for image processing'), false);
            }
        // Handle 'video' field name for video files
        } else if (file.fieldname === 'video') {
            if (file.mimetype.startsWith('video/')) {
                cb(null, true);
            } else {
                cb(new Error('Only video files are allowed for video processing'), false);
            }
        } else {
            // Reject any other unexpected field names
            cb(new Error('Unexpected field name'), false);
        }
    }
});

// Logger middleware - Logs incoming requests and file details if present
router.use((req, res, next) => {
    console.log(` ${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.file) {
        console.log(` File: ${req.file.originalname} (${req.file.size} bytes)`);
    } else if (req.files && Array.isArray(req.files)) { // Handle array of files (e.g., 'frames')
        req.files.forEach(file => {
            console.log(` File (array): ${file.originalname} (${file.size} bytes)`);
        });
    }
    next();
});

// ========================================
// API Routes
// ========================================

// Authentication Routes
router.post("/auth/signup", signUpUser);
router.post("/auth/login", loginUser);
router.post("/auth/logout", logoutUser); // Requires authentication
router.post('/auth/reset-password', resetPassword);
router.post('/auth/confirm-reset-password', confirmPasswordReset);

// User Profile and Management Routes (most require authentication)
router.get("/user/me", authenticateUser, getUserData); // Get current authenticated user's data
router.put('/user/:id/details', authenticateUser, updateUserDetails);
router.put('/user/:id/password', authenticateUser, updateUserPassword);
router.put('/user/:id/avatar', authenticateUser, uploadUserAvatar); // Upload user avatar, requires authentication
router.delete('/user/:id', authenticateUser, deleteUserAccount); // Delete user account, requires authentication

// Learning Progress Routes (require authentication)
router.get("/learning/progress/:username", authenticateUser, learningProgress);
router.put("/learning/progress/:username", authenticateUser, learningProgress);

// Uniqueness Checks (do not require authentication)
router.get("/auth/unique-username/:username", uniqueUsername);
router.get("/auth/unique-email/:email", uniqueEmail);

// AI Processing Routes
router.get('/test-python', testPython); // Route to test connection with Python/Flask backend
router.post('/process-sign', upload.single('image'), processSign); // Process single image for sign recognition
router.post('/process-video', upload.single('video'), processVideo); // Process single video
// router.post('/sign/processFrames', upload.array('frames'), processImage); // Uncomment if processImage is integrated for frames
router.get('/health', healthCheck); // Health check for the service

// Error handling middleware for Multer and other errors
router.use((error, req, res, next) => {
    // Handle Multer-specific errors (e.g., file size limit)
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

    // Handle custom file type validation errors
    if (error.message.includes('Only image files') || error.message.includes('Only video files')) {
        return res.status(400).json({
            error: 'Invalid file type',
            details: error.message
        });
    }

    // Generic error handler for all other errors, including those from controller functions
    // and network errors (e.g., if the Flask server is unreachable or returns non-2xx)
    console.error("Caught error in API routes:", error);

    // Attempt to extract status and message from Axios response if available
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || "An unexpected error occurred.";
    const details = error.response?.data?.details || error.stack; // Include stack trace for debugging

    res.status(status).json({
        error: message,
        details: details
    });
});

export default router;
