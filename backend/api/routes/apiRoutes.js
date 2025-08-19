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
    processSignOrVideo,
    // processSign,
    // processVideo,
    healthCheck
} from '../controllers/modelController.js';

import multer from 'multer';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, 
    },
    fileFilter: (req, file, cb) => {
        console.log(` Multer fileFilter: ${file.originalname}, mimetype: ${file.mimetype}, fieldname: ${file.fieldname}`);

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

router.use((req, res, next) => {
    console.log(` ${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.file) {
        console.log(` File: ${req.file.originalname} (${req.file.size} bytes), field: ${req.file.fieldname}`);
    } else if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => {
            console.log(` File (array): ${file.originalname} (${file.size} bytes), field: ${file.fieldname}`);
        });
    }
    next();
});

//added to work for performance monitoring
router.use((req, res, next) => {
    const startTime = process.hrtime(); 

    res.on('finish', () => {
        const diff = process.hrtime(startTime);
        const nanoseconds = diff[0] * 1e9 + diff[1];
        const milliseconds = nanoseconds / 1e6;
        console.log(`[PERFORMANCE] ${req.method} ${req.originalUrl} finished in ${milliseconds.toFixed(2)}ms`);
    });

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
// The /process-sign endpoint now handles both single-frame and multi-frame requests.
router.post(
    '/process-sign',
    upload.array('frames'), 
    (req, res, ) => {
        // We will call the same function but pass a different mode.
        // req.body.mode will come from the frontend (e.g., in the form data)
        const mode = req.body.mode;
        if (mode === 'fingerspelling') {
            // This route now expects frames to be sent from the frontend.
            // You'll need to update your front-end to capture a single frame and send it as 'frames'.
            processSignOrVideo(req, res, 'fingerspelling');
        } else if (mode === 'words') {
            // This route expects a sequence of frames for word detection.
            processSignOrVideo(req, res, 'words');
        } else {
            return res.status(400).json({ error: "Invalid mode specified" });
        }
    }
);

router.get('/health', healthCheck);

router.use((error, req, res, next) => { 
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                details: `Maximum file size is ${upload.limits.fileSize / (1024 * 1024)}MB`
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

    const status = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.error || error.message || "An unexpected error occurred.";
    const details = error.response?.data?.details || error.stack;

    res.status(status).json({
        error: message,
        details: details
    });

    next(); 
});

export default router;