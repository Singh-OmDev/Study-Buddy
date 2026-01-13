import express from 'express';
import { generateContent, getHistory, getChatHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateContent);
router.get('/history', protect, getHistory);
router.get('/history/chat', protect, getChatHistory);

export default router;
