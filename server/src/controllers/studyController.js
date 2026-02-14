import StudyLog from '../models/StudyLog.js';
import { generateAIContent } from '../services/aiService.js';
import redis from '../config/redis.js';

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

        // SAVE LOG IMMEDIATELY (Don't wait for AI)
        const studyLog = await StudyLog.create({
            user: req.user._id,
            subject,
            topic,
            durationMinutes,
            notes,
            confidenceLevel: confidence,
            revisionDueDate
        });

        // AI Analysis in Background (Non-blocking)
        if (notes && notes.length > 10) {
            // Fire and forget - don't await
            (async () => {
                try {
                    console.log(`[Background] Analyzing study log ${studyLog._id}...`);
                    const analysis = await generateAIContent('analysis', notes);

                    // Validate/Normalize AI response
                    const validDifficulty = ['Easy', 'Medium', 'Hard'].includes(analysis.difficulty)
                        ? analysis.difficulty
                        : 'Medium';

                    const aiData = {
                        aiSummary: analysis.summary || "No summary generated",
                        aiTags: Array.isArray(analysis.tags) ? analysis.tags : [],
                        aiQuestions: Array.isArray(analysis.questions) ? analysis.questions : [],
                        difficultyLevel: validDifficulty
                    };

                    // Update the log with AI data
                    await StudyLog.findByIdAndUpdate(studyLog._id, aiData);
                    console.log(`[Background] AI enrichment complete for ${studyLog._id}`);
                } catch (aiError) {
                    console.error(`[Background] AI enrichment failed for ${studyLog._id}:`, aiError.message);
                }
            })();
        }

        if (redis.status !== 'disabled') {
            await redis.del(`stats:${req.user._id}`);
        }
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
        const cacheKey = `stats:${req.user._id}`;

        // Try to fetch from cache
        if (redis.status !== 'disabled') {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                console.log("Serving stats from Redis Cache");
                // Upstash Redis returns object directly, ioredis returns string
                return res.json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
            }
        }

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

        const recentLogs = logs.slice(-5).reverse();

        const responseData = {
            totalLogs: logs.length,
            totalHours,
            subjectStats,
            streak,
            recentLogs
        };

        // Save to cache
        if (redis.status !== 'disabled') {
            // Upstash (HTTP) uses .set(key, val, { ex: s }), ioredis uses .setex(key, s, val)
            if (typeof redis.setex === 'function') {
                await redis.setex(cacheKey, 3600, JSON.stringify(responseData));
            } else {
                await redis.set(cacheKey, responseData, { ex: 3600 });
            }
        }

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Delete study log
// @route   DELETE /api/study/:id
// @access  Private
const deleteStudyLog = async (req, res) => {
    try {
        const log = await StudyLog.findById(req.params.id);

        if (!log) {
            return res.status(404).json({ message: 'Log not found' });
        }

        // Ensure user owns the log
        if (log.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await log.deleteOne();

        if (redis.status !== 'disabled') {
            await redis.del(`stats:${req.user._id}`);
        }

        res.json({ message: 'Study log removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createStudyLog, getStudyLogs, getStats, deleteStudyLog };
