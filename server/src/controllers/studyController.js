import StudyLog from '../models/StudyLog.js';
import { generateAIContent } from '../services/aiService.js';
import redis from '../config/redis.js';

// create a log
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
            console.log("missing stuff in req.body:", req.body); // was getting undefined earlier
            res.status(400).json({ message: 'Please add all required fields' });
            return;
        }

        // figure out when to revise next depending on how confident they were
        const today = new Date();
        let revisionDays = 3;
        const confidence = parseInt(confidenceLevel) || 3;

        if (confidence <= 2) revisionDays = 1;
        if (confidence >= 4) revisionDays = 7;

        const revisionDueDate = new Date(today);
        revisionDueDate.setDate(revisionDueDate.getDate() + revisionDays);

        // don't wait for AI to finish, just save it now
        const studyLog = await StudyLog.create({
            user: req.user._id,
            subject,
            topic,
            durationMinutes,
            notes,
            confidenceLevel: confidence,
            revisionDueDate
        });

        // run AI stuff in background so user doesn't wait
        if (notes && notes.length > 10) {
            // fire and forget
            (async () => {
                try {
                    // console.log("starting background jobs for log ", studyLog._id);
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

const getStudyLogs = async (req, res) => {
    try {
        const logs = await StudyLog.find({ user: req.user._id }).sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// calc stats for dashboard
const getStats = async (req, res) => {
    try {
        const timeframe = req.query.timeframe || 'this_week';
        const cacheKey = `stats:${req.user._id}:${timeframe}`;

        // Try to fetch from cache
        if (redis.status !== 'disabled') {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                console.log("Serving stats from Redis Cache for timeframe:", timeframe);
                return res.json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
            }
        }

        const allLogs = await StudyLog.find({ user: req.user._id });

        // Streak Calculation using ALl logs spanning forever
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - 86400000;

        const studyDates = [...new Set(allLogs.map(log => {
            const d = new Date(log.date);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        }))].sort((a, b) => b - a);

        let streak = 0;
        if (studyDates.length > 0) {
            const lastStudyDate = studyDates[0];
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

        // Timeframe boundary logic
        let startDate = null;
        let endDate = null;
        const current = new Date();
        // Zero out current time to start of day for easier math
        const todayAtMidnight = new Date(current.getFullYear(), current.getMonth(), current.getDate());

        if (timeframe === 'this_week') {
            const dayOfWeek = todayAtMidnight.getDay(); // 0 is Sunday
            // Start of this week (Sunday)
            startDate = new Date(todayAtMidnight);
            startDate.setDate(todayAtMidnight.getDate() - dayOfWeek);
        } else if (timeframe === 'prev_week') {
            const dayOfWeek = todayAtMidnight.getDay();
            // End of prev week (Saturday)
            endDate = new Date(todayAtMidnight);
            endDate.setDate(todayAtMidnight.getDate() - dayOfWeek - 1);
            // End of day
            endDate.setHours(23, 59, 59, 999);
            // Start of prev week (Sunday)
            startDate = new Date(todayAtMidnight);
            startDate.setDate(todayAtMidnight.getDate() - dayOfWeek - 7);
        } else if (timeframe === 'this_month') {
            startDate = new Date(todayAtMidnight.getFullYear(), todayAtMidnight.getMonth(), 1);
        } else if (timeframe === 'prev_month') {
            startDate = new Date(todayAtMidnight.getFullYear(), todayAtMidnight.getMonth() - 1, 1);
            endDate = new Date(todayAtMidnight.getFullYear(), todayAtMidnight.getMonth(), 0);
            endDate.setHours(23, 59, 59, 999);
        }

        // Filter logs strictly for charts/totals
        const logs = allLogs.filter(log => {
            if (timeframe === 'all_time') return true;
            const logDate = new Date(log.date).getTime();
            const afterStart = startDate ? logDate >= startDate.getTime() : true;
            const beforeEnd = endDate ? logDate <= endDate.getTime() : true;
            return afterStart && beforeEnd;
        });

        const totalMinutes = logs.reduce((acc, log) => acc + log.durationMinutes, 0);
        const totalHours = (totalMinutes / 60).toFixed(1);

        const subjectStats = logs.reduce((acc, log) => {
            acc[log.subject] = (acc[log.subject] || 0) + log.durationMinutes;
            return acc;
        }, {});

        // Recent logs strictly bounded by the timeframe
        const recentLogs = logs.slice(-5).reverse();

        // Calculate "Due for Revision" using ALL logs
        const latestLogsByTopic = {};
        allLogs.forEach(log => {
            const key = `${log.subject.toLowerCase()}-${log.topic.toLowerCase()}`;
            if (!latestLogsByTopic[key] || new Date(log.date) > new Date(latestLogsByTopic[key].date)) {
                latestLogsByTopic[key] = log;
            }
        });

        const nowTime = new Date().getTime();
        const dueForRevision = Object.values(latestLogsByTopic)
            .filter(log => log.revisionDueDate && new Date(log.revisionDueDate).getTime() <= nowTime)
            .sort((a, b) => new Date(a.revisionDueDate) - new Date(b.revisionDueDate))
            .slice(0, 5); // Limit to top 5 most overdue

        const responseData = {
            totalLogs: logs.length,
            totalHours,
            subjectStats,
            streak,     // Streak is from ALL-TIME logs, so it never resets artificially
            recentLogs,
            dueForRevision // Append the tracked revisions
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


// Knowledge Gap Analyzer - scores every topic by how likely it is forgotten
const getKnowledgeGaps = async (req, res) => {
    try {
        const logs = await StudyLog.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
        
        if (logs.length === 0) {
            return res.json([]);
        }

        const now = new Date();

        // Score each log: older + lower confidence = higher danger
        const scored = logs.map(log => {
            const ageInDays = Math.max(1, Math.floor((now - new Date(log.createdAt)) / (1000 * 60 * 60 * 24)));
            const confidence = log.confidenceLevel || 3;
            // weakness: old logs with low confidence score highest
            const weaknessScore = ageInDays * (6 - confidence);
            return {
                _id: log._id,
                topic: log.topic,
                subject: log.subject,
                notes: log.notes || '',
                confidenceLevel: confidence,
                ageInDays,
                weaknessScore: Math.round(weaknessScore),
                createdAt: log.createdAt
            };
        });

        // Sort by weakness and return top 5
        scored.sort((a, b) => b.weaknessScore - a.weaknessScore);
        res.json(scored.slice(0, 5));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createStudyLog, getStudyLogs, getStats, deleteStudyLog, getKnowledgeGaps };
