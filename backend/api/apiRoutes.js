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
  getUserData
} from './controllers/dbController.js';

const router = Router();

router.post("/auth/signup", signUpUser);
router.post("/auth/login", loginUser);
router.post("/auth/logout", logoutUser);

router.get("/user/me", authenticateUser, getUserData); 
router.put('/user/:id/details', authenticateUser, updateUserDetails);
router.put('/user/:id/password', authenticateUser, updateUserPassword);

router.get("/learning/progress/:username", authenticateUser, learningProgress); 
router.put("/learning/progress/:username", authenticateUser, learningProgress);

router.get("/auth/unique-username/:username", uniqueUsername);
router.get("/auth/unique-email/:email", uniqueEmail);

export default router;