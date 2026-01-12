import mongoose from 'mongoose';

const aiHistorySchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // 'summary', 'flashcards', 'quiz', etc.
    inputContext: { type: String }, // The notes/text provided
    result: { type: String, required: true }, // The AI output
}, { timestamps: true });

const AIHistory = mongoose.model('AIHistory', aiHistorySchema);
export default AIHistory;
