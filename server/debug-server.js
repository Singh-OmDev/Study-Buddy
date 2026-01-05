import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import StudyLog from './src/models/StudyLog.js';
import { generateAIContent } from './src/services/aiService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const runTest = async () => {
    await connectDB();

    console.log("1. Testing AI Service...");
    try {
        const res = await generateAIContent('analysis', "I studied Newton's laws of motion. First law is inertia. Second is F=ma. Third is action-reaction.");
        console.log("AI Result:", JSON.stringify(res, null, 2));
    } catch (err) {
        console.error("AI Service Failed:", err);
    }

    console.log("\n2. Testing Database Save (Mock)...");
    try {
        // Mock user ID - needs to be a valid ObjectId. 
        // We'll Create a dummy log without user check if schema allows, or use a fake one.
        // User reference is required in Schema.
        const fakeUserId = new mongoose.Types.ObjectId();

        const log = await StudyLog.create({
            user: fakeUserId,
            subject: "Test Physics",
            topic: "Test Topic",
            durationMinutes: 60,
            notes: "Test notes",
            confidenceLevel: 4,
            revisionDueDate: new Date(),
            aiSummary: "AI Summary Test",
            aiTags: ["Physics", "Test"],
            difficultyLevel: "Easy"
        });
        console.log("Database Save Success:", log._id);
    } catch (err) {
        console.error("Database Save Failed:", err);
    }

    process.exit();
};

runTest();
