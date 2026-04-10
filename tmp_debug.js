import mongoose from 'mongoose';
import StudyLog from './server/src/models/StudyLog.js';
import User from './server/src/models/User.js';

import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("Users:");
    const users = await User.find({});
    users.forEach(u => console.log(u.name, u.clerkId, u._id));

    console.log("\nLogs:");
    const logs = await StudyLog.find({}).populate('user');
    logs.forEach(l => {
        console.log(`${l.user?.name || 'Unknown'}: ${l.subject} (Confidence: ${l.confidenceLevel})`);
    });

    process.exit(0);
};
run();
