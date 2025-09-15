// routes/curriculumRoutes.js
import express from 'express';
import CurriculumController from '../controllers/curriculumController.js';

const router = express.Router();

console.log('Setting up curriculum routes...');

router.get('/curriculum/health', CurriculumController.healthCheck);
router.get('/curriculum/landmarks/:letter', CurriculumController.getLandmarks);
router.get('/curriculum/structure', CurriculumController.getCurriculumStructure);

console.log('Curriculum routes configured');

export default router;
