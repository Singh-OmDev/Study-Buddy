import mongoose from 'mongoose';

const chatSessionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    lastActive: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure one session per user for now (can expand to multiple threads later)
chatSessionSchema.index({ user: 1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession;
