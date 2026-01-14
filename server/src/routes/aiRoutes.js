import express from 'express';
import {
    generateContent,
    getHistory,
    getChatHistory,
    createSession,
    getAllSessions,
    getAllSessions,
    getSessionById,
    deleteSession
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
router.delete('/chat/:id', protect, deleteSession);

export default router;
