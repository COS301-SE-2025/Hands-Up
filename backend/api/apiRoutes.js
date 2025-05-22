import { Router } from 'express';
import { learningProgress } from './controllers/dbController.js';

const router = Router();

router.post("/learning/progress", learningProgress);

export default router;