import StudyLog from '../models/StudyLog.js';
import User from '../models/User.js';
import { generateAIContent } from '../services/aiService.js';

export const findStudyBuddy = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const currentUser = await User.findById(currentUserId);
        
        const io = req.app.locals.io;
        const onlineUsers = req.app.locals.onlineUsers;

        console.log(`[MATCHER] User ${currentUser.name} (${currentUserId}) is finding a buddy.`);
        console.log("[MATCHER] Global Online Map Keys:", Array.from(onlineUsers.keys()));

        // 1. If user passed a specific target subject, use it, otherwise find their struggling subjects
        const targetSubject = req.query.subject;
        let strugglingLogs = [];
        let matchedSockets = [];
        let matchedSubject = null;

        if (targetSubject) {
            console.log(`[MATCHER] User is specifically looking for help with: ${targetSubject}`);
            
            // Find users strong in THIS specific subject
            const strongMatchLogs = await StudyLog.find({
                user: { $ne: currentUserId },
                subject: { $regex: new RegExp(`^${targetSubject}$`, 'i') },
                confidenceLevel: { $gte: 4 }
            }).populate('user', 'name clerkId');

            matchedSockets = strongMatchLogs
                .filter(m => m.user && onlineUsers.has(m.user.clerkId))
                .map(m => onlineUsers.get(m.user.clerkId));

            if (matchedSockets.length > 0) {
                matchedSubject = targetSubject;
            } else {
                matchedSubject = targetSubject; // We'll fallback to general online users below if needed
            }
        } else {
            strugglingLogs = await StudyLog.find({
                user: currentUserId,
                confidenceLevel: { $lte: 3 }
            }).sort({ date: -1 }).limit(5);

            if (strugglingLogs.length > 0) {
                // Find ALL users who are strong in these subjects AND online (Case Insensitive)
                for (const log of strugglingLogs) {
                    const strongMatchLogs = await StudyLog.find({
                        user: { $ne: currentUserId },
                        subject: { $regex: new RegExp(`^${log.subject}$`, 'i') },
                        confidenceLevel: { $gte: 4 }
                    }).populate('user', 'name clerkId');

                    matchedSockets = strongMatchLogs
                        .filter(m => m.user && onlineUsers.has(m.user.clerkId))
                        .map(m => onlineUsers.get(m.user.clerkId));

                    if (matchedSockets.length > 0) {
                        matchedSubject = log.subject;
                        break;
                    }
                }
            }
        }

        // 2. If no perfect semantic match found, fallback to ALL other ONLINE users
        if (matchedSockets.length === 0) {
             for (const [clerkId, socketId] of onlineUsers.entries()) {
                 const potentialBuddy = await User.findOne({ clerkId });
                 if (potentialBuddy && potentialBuddy._id.toString() !== currentUserId.toString()) {
                     matchedSockets.push(socketId);
                     matchedSubject = "General Study";
                 }
             }
        }

        const roomId = `room_${currentUserId.toString()}_${Date.now()}`;

        if (matchedSockets.length > 0) {
            console.log(`[MATCHER] Sent ping to ${matchedSockets.length} mentors!`);
            if (io) {
                matchedSockets.forEach(targetSocketId => {
                    io.to(targetSocketId).emit('mentor-ping', {
                        requesterName: currentUser.name || "A student",
                        subject: matchedSubject,
                        roomId: roomId
                    });
                });
            }
        } else {
             console.log(`[MATCHER] No mentors found. Simulating search queue for AI fallback.`);
        }

        return res.json({
            status: 'pending',
            message: "Searching for mentors...",
            roomId,
            subject: matchedSubject || "General Study Help",
            buddyName: "Waiting for Mentors...",
            isAi: false
        });

    } catch (error) {
        console.error("Match error:", error);
        res.status(500).json({ message: "Failed to find match" });
    }
};

export const askBot = async (req, res) => {
    try {
        const { message, context, image } = req.body;
        
        const responseText = await generateAIContent("chat", context || "The user is studying.", message, image);
        
        res.json({ response: responseText });
    } catch (error) {
        console.error("Bot chat error", error);
        res.status(500).json({ error: "Failed to query AI Bot" });
    }
};
