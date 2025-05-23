import { Router } from 'express';
import { learningProgress } from './controllers/dbController.js';

const router = Router();

//These are out api routes
router.post("/learning/progress", learningProgress);

export default router;