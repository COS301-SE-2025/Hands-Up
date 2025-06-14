import { Router } from 'express';
import { learningProgress } from './controllers/dbController.js';
import { loginUser, signUpUser } from './controllers/dbController.js';
import { getUserData } from './controllers/dbController.js';
import { uniqueUsername } from './controllers/dbController.js';
import { uniqueEmail } from './controllers/dbController.js';
import { updateUserDetails } from './controllers/dbController.js';
import { updateUserPassword } from './controllers/dbController.js';
import { logoutUser } from './controllers/dbController.js';
import { authenticateUser } from './controllers/dbController.js';
import { getAuthenticatedUser } from './controllers/dbController.js';

const router = Router();

//These are out api routes
// router.get("/learning/progress/:username", learningProgress);
// router.put("/learning/progress/:username", learningProgress);
router.post("/auth/signup", signUpUser);  // Add this new route
router.post("/auth/login", loginUser);
router.post("/auth/logout", logoutUser);
//router.get("/user/:id", getUserData);
router.get("/auth/unique-username/:username", uniqueUsername);
router.get("/auth/unique-email/:email", uniqueEmail);
// router.put('/user/:id/details', updateUserDetails);
// router.put('/user/:id/password', updateUserPassword);


// Learning progress routes
router.get("/learning/progress/:username", authenticateUser, learningProgress); // <--- PROTECTED
router.put("/learning/progress/:username", authenticateUser, learningProgress); // <--- PROTECTED

// User data routes
router.get("/user/:id", authenticateUser, getUserData); // <--- PROTECTED
router.put('/user/:id/details', authenticateUser, updateUserDetails); // <--- PROTECTED
router.put('/user/:id/password', authenticateUser, updateUserPassword); 

router.get('/user/me', authenticateUser, getAuthenticatedUser); 
export default router;