import express from 'express';
import { findStudyBuddy, askBot } from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/find', protect, findStudyBuddy);
router.post('/bot', protect, askBot);

export default router;
