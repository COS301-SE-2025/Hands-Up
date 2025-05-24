import { Router } from 'express';
import { learningProgress,signUpUser } from './controllers/dbController.js';

const router = Router();

//These are out api routes
router.post("/learning/progress", learningProgress);
router.post("/auth/signup", signUpUser);  // Add this new route

export default router;