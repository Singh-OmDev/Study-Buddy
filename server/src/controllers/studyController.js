import StudyLog from '../models/StudyLog.js';
import { generateAIContent } from '../services/aiService.js';

// @desc    Create new study log
// @route   POST /api/study
// @access  Private
const createStudyLog = async (req, res) => {
    try {
        const {
            subject,
            topic,
            durationMinutes,
            notes,
            confidenceLevel
        } = req.body;

        if (!subject || !topic || !durationMinutes) {
            res.status(400).json({ message: 'Please add all required fields' });
            return;
        }

        // Smart Revision Logic (Rule-based)
        const today = new Date();
        let revisionDays = 3;
        const confidence = parseInt(confidenceLevel) || 3;

        if (confidence <= 2) revisionDays = 1;
        if (confidence >= 4) revisionDays = 7;

        const revisionDueDate = new Date(today);
        revisionDueDate.setDate(revisionDueDate.getDate() + revisionDays);

        // AI Automatic Analysis (Enrichment)
        let aiData = {};
        if (notes && notes.length > 10) {
            try {
                console.log("Analyzing study notes with AI...");
                const analysis = await generateAIContent('analysis', notes);

                // Validate/Normalize AI response to match Schema
                const validDifficulty = ['Easy', 'Medium', 'Hard'].includes(analysis.difficulty)
                    ? analysis.difficulty
                    : 'Medium';

                aiData = {
                    aiSummary: analysis.summary || "No summary generated",
                    aiTags: Array.isArray(analysis.tags) ? analysis.tags : [],
                    aiQuestions: Array.isArray(analysis.questions) ? analysis.questions : [],
                    difficultyLevel: validDifficulty
                };
                console.log("AI Analysis Success:", aiData);
            } catch (aiError) {
                console.error("AI Enrichment Failed (Continuing without it):", aiError.message);
                // Continue without AI data
            }
        }

        const studyLog = await StudyLog.create({
            user: req.user._id,
            subject,
            topic,
            durationMinutes,
            notes,
            confidenceLevel: confidence,
            revisionDueDate,
            ...aiData
        });

        res.status(201).json(studyLog);
    } catch (error) {
        console.error("Create Study Log Error:", error);
        res.status(500).json({ message: "Failed to save log: " + error.message });
    }
};

// @desc    Get user study logs
// @route   GET /api/study
// @access  Private
const getStudyLogs = async (req, res) => {
    try {
        const logs = await StudyLog.find({ user: req.user._id }).sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get Stats
// @route GET /api/study/stats
// @access Private
const getStats = async (req, res) => {
    try {
        const logs = await StudyLog.find({ user: req.user._id });

        const totalMinutes = logs.reduce((acc, log) => acc + log.durationMinutes, 0);
        const totalHours = (totalMinutes / 60).toFixed(1);

        const subjectStats = logs.reduce((acc, log) => {
            acc[log.subject] = (acc[log.subject] || 0) + log.durationMinutes;
            return acc;
        }, {});

        // Calculate Streak
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - 86400000;

        // Get unique study dates (normalized to midnight)
        const studyDates = [...new Set(logs.map(log => {
            const d = new Date(log.date);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        }))].sort((a, b) => b - a);

        let streak = 0;
        if (studyDates.length > 0) {
            const lastStudyDate = studyDates[0];

            // Streak is valid if last study was today or yesterday
            if (lastStudyDate === startOfToday || lastStudyDate === startOfYesterday) {
                streak = 1;
                let expectedPrevDate = lastStudyDate - 86400000;

                for (let i = 1; i < studyDates.length; i++) {
                    if (studyDates[i] === expectedPrevDate) {
                        streak++;
                        expectedPrevDate -= 86400000;
                    } else {
                        break;
                    }
                }
            }
        }

        res.json({
            totalLogs: logs.length,
            totalHours,
            subjectStats,
            streak
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { createStudyLog, getStudyLogs, getStats };
