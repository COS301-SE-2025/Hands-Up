// routes/dbController.js
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
    deleteUserAccount // <--- ADD THIS IMPORT
} from './controllers/dbController.js';

import { resetPassword, confirmPasswordReset } from './controllers/dbController.js';

const router = Router();

router.post("/auth/signup", signUpUser);
router.post("/auth/login", loginUser);
router.post("/auth/logout", logoutUser);

router.get("/user/me", authenticateUser, getUserData); 
router.put('/user/:id/details', authenticateUser, updateUserDetails);
router.put('/user/:id/password', authenticateUser, updateUserPassword);
router.delete('/user/:id', authenticateUser, deleteUserAccount); 

router.get("/learning/progress/:username", authenticateUser, learningProgress); 
router.put("/learning/progress/:username", authenticateUser, learningProgress);

router.get("/auth/unique-username/:username", uniqueUsername);
router.get("/auth/unique-email/:email", uniqueEmail);

router.post('/reset-password', resetPassword);
router.post('/confirm-reset-password', confirmPasswordReset);
export default router;