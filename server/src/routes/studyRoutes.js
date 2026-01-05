import express from 'express';
import { createStudyLog, getStudyLogs, getStats } from '../controllers/studyController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/').post(protect, createStudyLog).get(protect, getStudyLogs);
router.get('/stats', protect, getStats);

export default router;
