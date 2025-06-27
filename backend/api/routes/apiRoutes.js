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
    confirmPasswordReset
} from '../controllers/dbController.js';

import {
    testPython,
    processSign,
    processVideo,
    healthCheck
} from '../controllers/modelController.js';

import multer from 'multer';

const router = Router();

// Multer storage setup to use memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for file uploads
    },
    fileFilter: (req, file, cb) => {
        console.log(` File upload: ${file.originalname}, mimetype: ${file.mimetype}`);

        if (file.fieldname === 'image' || file.fieldname === 'frames' || file.fieldname === 'avatar') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for image processing or avatars'), false);
            }
        } else if (file.fieldname === 'video') {
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

// Logger middleware - Logs incoming requests and file details if present
router.use((req, res, next) => {
    console.log(` ${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.file) {
        console.log(` File: ${req.file.originalname} (${req.file.size} bytes)`);
    } else if (req.files && Array.isArray(req.files)) {
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
router.post("/auth/logout", authenticateUser, logoutUser);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/confirm-reset-password', confirmPasswordReset);

// User Profile and Management Routes
router.get("/user/me", authenticateUser, getUserData);
router.put('/user/:id/details', authenticateUser, updateUserDetails);
router.put('/user/:id/password', authenticateUser, updateUserPassword);
router.put('/user/:id/avatar', authenticateUser, upload.single('avatar'), uploadUserAvatar);
router.delete('/user/:id', authenticateUser, deleteUserAccount);

// Learning Progress Routes
router.get("/learning/progress/:username", authenticateUser, learningProgress);
router.put("/learning/progress/:username", authenticateUser, learningProgress);

// Uniqueness Checks
router.get("/auth/unique-username/:username", uniqueUsername);
router.get("/auth/unique-email/:email", uniqueEmail);

// AI Processing Routes
router.get('/test-python', testPython);
router.post(
    '/process-sign',
    upload.single('image'),
    processSign
);
router.post(
    '/process-video',
    upload.single('video'),
    (req, res, next) => {
        // This console log will fire when the /process-video route is reached,
        // after multer has processed the file (if successful).
        console.log('>>> Route /process-video reached in routes.js <<<');
        if (req.file) {
            console.log(`Video file received: ${req.file.originalname}`);
        } else {
            console.log('No video file attached to request (or multer failed).');
        }
        next(); // Pass control to the next middleware/controller function (processVideo)
    },
    processVideo
);
router.get('/health', healthCheck);

// Error handling middleware
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

    if (error.message.includes('Only image files') || error.message.includes('Only video files') || error.message.includes('Unexpected field name')) {
        return res.status(400).json({
            error: 'Invalid file or field type',
            details: error.message
        });
    }

    console.error("Caught error in API routes:", error);

    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || "An unexpected error occurred.";
    const details = error.response?.data?.details || error.stack;

    res.status(status).json({
        error: message,
        details: details
    });
});

export default router;
