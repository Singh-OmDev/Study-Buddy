import express from 'express';
import { generateContent } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/generate', protect, generateContent);

export default router;
