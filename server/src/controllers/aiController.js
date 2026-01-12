import { generateAIContent } from '../services/aiService.js';
import StudyLog from '../models/StudyLog.js';
import AIHistory from '../models/AIHistory.js';

const generateContent = async (req, res) => {
    const { type, prompt, context } = req.body;

    try {
        // Special Handling for Chat: Retrieve user context
        let aiContext = context;
        if (type === 'chat') {
            // RAG: Fetch last 20 study logs
            const logs = await StudyLog.find({ user: req.user._id })
                .sort({ date: -1 })
                .limit(20)
                .select('subject topic date aiSummary confidenceLevel'); // Select relevant fields

            // Format logs into string
            const history = logs.map(log =>
                `- [${new Date(log.date).toLocaleDateString()}] ${log.subject}: ${log.topic} (Confidence: ${log.confidenceLevel}/5). Notes: ${log.aiSummary}`
            ).join('\n');

            aiContext = history.length > 0 ? history : "No study history found yet.";
        }

        const result = await generateAIContent(type, aiContext, prompt);

        const finalResult = typeof result === 'string' ? result : JSON.stringify(result);

        // Save to History (skip chat for now as it's ephemeral usually, or save it too if desired)
        if (type !== 'chat') {
            await AIHistory.create({
                user: req.user._id,
                type,
                inputContext: context ? context.substring(0, 500) + (context.length > 500 ? "..." : "") : "",
                result: finalResult
            });
        }

        res.json({ result: finalResult });
    } catch (error) {
        console.error("AI Controller Error:", error);
        // Graceful fallback for demo if key missing
        if (error.message.includes("Missing API Key")) {
            return res.json({ result: "Simulation: Please configure GROQ_API_KEY in .env to get real AI responses." });
        }
        res.status(500).json({ message: "AI generation failed: " + error.message });
    }
}

const getHistory = async (req, res) => {
    try {
        const history = await AIHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch history" });
    }
};

export { generateContent, getHistory };
