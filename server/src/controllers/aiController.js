import { generateAIContent } from '../services/aiService.js';
import StudyLog from '../models/StudyLog.js';
import AIHistory from '../models/AIHistory.js';
import ChatSession from '../models/ChatSession.js';

const createSession = async (req, res) => {
    try {
        const session = await ChatSession.create({
            user: req.user._id,
            title: 'New Chat'
        });
        res.json(session);
    } catch (error) {
        console.error("createSession Error:", error);
        res.status(500).json({ message: "Failed to create session" });
    }
};

const getAllSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ user: req.user._id })
            .select('title lastActive createdAt')
            .sort({ lastActive: -1 });
        res.json(sessions);
    } catch (error) {
        console.error("getAllSessions Error:", error);
        res.status(500).json({ message: "Failed to fetch sessions" });
    }
};

const getSessionById = async (req, res) => {
    try {
        const session = await ChatSession.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.json(session);
    } catch (error) {
        console.error("getSessionById Error:", error);
        res.status(500).json({ message: "Failed to fetch session" });
    }
};

const generateContent = async (req, res) => {
    const { type, prompt, context, sessionId } = req.body;

    try {
        // Special Handling for Chat: Retrieve user context
        let aiContext = context || "";

        if (type === 'chat') {
            // RAG: Fetch last 20 study logs
            const logs = await StudyLog.find({ user: req.user._id })
                .sort({ date: -1 })
                .limit(20)
                .select('subject topic date aiSummary confidenceLevel');

            const history = logs.map(log =>
                `- [${new Date(log.date).toLocaleDateString()}] ${log.subject}: ${log.topic} (Confidence: ${log.confidenceLevel}/5). Notes: ${log.aiSummary}`
            ).join('\n');

            const historyText = history.length > 0 ? history : "No study history found yet.";

            if (aiContext) {
                aiContext = `[UPLOADED DOCUMENT CONTENT]:\n${aiContext}\n\n[STUDY LOG HISTORY]:\n${historyText}`;
            } else {
                aiContext = `[STUDY LOG HISTORY]:\n${historyText}`;
            }
        }

        // Save User Message to ChatSession
        if (type === 'chat' && sessionId) {
            await ChatSession.findOneAndUpdate(
                { _id: sessionId, user: req.user._id },
                {
                    $push: { messages: { role: 'user', content: prompt } },
                    $set: { lastActive: Date.now() }
                }
            );

            // Auto-update title if it's "New Chat" (First message)
            const session = await ChatSession.findById(sessionId);
            if (session && session.title === 'New Chat') {
                const newTitle = prompt.split(' ').slice(0, 5).join(' ') + '...';
                session.title = newTitle;
                await session.save();
            }
        }

        const result = await generateAIContent(type, aiContext, prompt);
        const finalResult = typeof result === 'string' ? result : JSON.stringify(result);

        // Save AI Response
        if (type === 'chat' && sessionId) {
            await ChatSession.findOneAndUpdate(
                { _id: sessionId, user: req.user._id },
                {
                    $push: { messages: { role: 'assistant', content: finalResult } },
                    $set: { lastActive: Date.now() }
                }
            );
        } else if (type !== 'chat') {
            await AIHistory.create({
                user: req.user._id,
                type,
                inputContext: context ? context.substring(0, 500) + "..." : "",
                result: finalResult
            });
        }

        res.json({ result: finalResult });
    } catch (error) {
        console.error("AI Controller Error:", error);
        if (error.message.includes("Missing API Key")) {
            return res.json({ result: "Simulation: Please configure GROQ_API_KEY." });
        }
        res.status(500).json({ message: "AI generation failed: " + error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const history = await AIHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch history" });
    }
};

// Deprecated: Single session compatibility
const getChatHistory = async (req, res) => {
    try {
        const session = await ChatSession.findOne({ user: req.user._id });
        res.json(session ? session.messages : []);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch chat history" });
    }
};

export { generateContent, getHistory, getChatHistory, createSession, getAllSessions, getSessionById };
