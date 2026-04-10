import express from 'express';
import {
    generateContent,
    getHistory,
    getChatHistory,
    createSession,
    getAllSessions,
    getSessionById,
    deleteSession,
    getYoutubeTranscript
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateContent);
router.post('/youtube', protect, getYoutubeTranscript);
router.get('/youtube', (req, res) => res.status(405).json({ message: 'Please use the Study Lab interface to generate transcripts.' }));
router.get('/history', protect, getHistory);
router.get('/history/chat', protect, getChatHistory); // Deprecated single session

// Multi-session Routes
router.post('/chat/new', protect, createSession);
router.get('/chat/sessions', protect, getAllSessions);
router.get('/chat/:id', protect, getSessionById);
router.delete('/chat/:id', protect, deleteSession);

export default router;
