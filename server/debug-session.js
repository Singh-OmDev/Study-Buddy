import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ChatSession from './src/models/ChatSession.js';

dotenv.config();

const debug = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        console.log("Creating Test Session...");
        // Use a fake user ID for testing (ObjectId)
        const fakeUserId = new mongoose.Types.ObjectId();

        const session = await ChatSession.create({
            user: fakeUserId,
            title: 'Debug Session'
        });

        console.log("Session Created Successfully:", session);

        console.log("Finding Session...");
        const found = await ChatSession.findById(session._id);
        console.log("Session Found:", found);

        await ChatSession.deleteOne({ _id: session._id });
        console.log("Cleaned up.");

        process.exit(0);
    } catch (error) {
        console.error("DEBUG FAILED:", error);
        process.exit(1);
    }
};

debug();
