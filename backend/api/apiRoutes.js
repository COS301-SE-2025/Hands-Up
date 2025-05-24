import { Router } from 'express';
import { learningProgress,signUpUser } from './controllers/dbController.js';
import { loginUser } from './controllers/dbController.js';
import { getUserData } from './controllers/dbController.js';
import { uniqueUsername } from './controllers/dbController.js';
import { updateUserDetails } from './controllers/dbController.js';

const router = Router();

//These are out api routes
router.post("/learning/progress", learningProgress);
router.post("/auth/signup", signUpUser);  // Add this new route
router.post("/auth/login", loginUser);
router.get("/user/:id", getUserData);
router.get("/auth/unique-username/:username", uniqueUsername);
router.put('/user/:id', updateUserDetails);

export default router;