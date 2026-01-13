import express from 'express';
import {
    generateContent,
    getHistory,
    getChatHistory,
    createSession,
    getAllSessions,
    getSessionById
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateContent);
router.get('/history', protect, getHistory);
router.get('/history/chat', protect, getChatHistory); // Deprecated single session

// Multi-session Routes
router.post('/chat/new', protect, createSession);
router.get('/chat/sessions', protect, getAllSessions);
router.get('/chat/:id', protect, getSessionById);

export default router;
