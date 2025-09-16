import express from 'express';
import CurriculumController from '../controllers/curriculumController.js';

const router = express.Router();

console.log('Setting up curriculum routes...');

router.get('/health', CurriculumController.healthCheck);
router.get('/landmarks/:letter', CurriculumController.getLandmarks);
router.get('/structure', CurriculumController.getCurriculumStructure);
router.get('/landmarks', CurriculumController.listLandmarks);

console.log('Curriculum routes configured');

export default router;
