import { Router } from 'express';
import { learningProgress } from './controllers/dbController.js';

const router = Router();

//These are out api routes
router.get("/learning/progress/:username", learningProgress);
router.put("/learning/progress/:username", learningProgress);

export default router;