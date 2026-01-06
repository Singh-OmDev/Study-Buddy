import { generateAIContent } from '../services/aiService.js';
import StudyLog from '../models/StudyLog.js';

const generateContent = async (req, res) => {
    const { type, prompt, context } = req.body;

    // Credit Check
    if (req.user.plan === 'free' && req.user.credits <= 0) {
        return res.status(403).json({
            message: "You have used all your free AI credits. Upgrade to Pro for unlimited access.",
            outOfCredits: true
        });
    }

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

        // Deduct Credit if Free Plan
        if (req.user.plan === 'free') {
            req.user.credits = Math.max(0, req.user.credits - 1);
            await req.user.save();
        }

        res.json({ result: typeof result === 'string' ? result : JSON.stringify(result) });
    } catch (error) {
        console.error("AI Controller Error:", error);
        // Graceful fallback for demo if key missing
        if (error.message.includes("Missing API Key")) {
            return res.json({ result: "Simulation: Please configure GROQ_API_KEY in .env to get real AI responses." });
        }
        res.status(500).json({ message: "AI generation failed: " + error.message });
    }
}

export { generateContent };
