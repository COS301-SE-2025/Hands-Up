import { Router } from 'express';
import { learningProgress } from './controllers/dbController.js';
import { loginUser, signUpUser } from './controllers/dbController.js';
import { getUserData } from './controllers/dbController.js';
import { uniqueUsername } from './controllers/dbController.js';
import { uniqueEmail } from './controllers/dbController.js';
import { updateUserDetails } from './controllers/dbController.js';
import { updateUserPassword } from './controllers/dbController.js';

const router = Router();

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

export default router;