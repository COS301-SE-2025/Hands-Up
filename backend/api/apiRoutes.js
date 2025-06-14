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

router.get("/user/me", authenticateUser, getUserData); // New route for authenticated user's own data
router.put('/user/:id/details', authenticateUser, updateUserDetails); // Still uses :id for direct update
router.put('/user/:id/password', authenticateUser, updateUserPassword); // Still uses :id for direct update

router.get("/learning/progress/:username", authenticateUser, learningProgress); 
router.put("/learning/progress/:username", authenticateUser, learningProgress);

router.get("/auth/unique-username/:username", uniqueUsername);
router.get("/auth/unique-email/:email", uniqueEmail);

export default router;