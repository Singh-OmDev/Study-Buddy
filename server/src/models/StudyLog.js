import mongoose from 'mongoose';

const studyLogSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    notes: { type: String }, // Acts as "rawStudyText"

    // metrics
    confidenceLevel: { type: Number, min: 1, max: 5, default: 3 },
    difficultyLevel: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    revisionDueDate: { type: Date },

    // ai stuff based on the raw text
    aiSummary: { type: String },
    aiTags: [{ type: String }],
    aiQuestions: [{ type: String }], // Array of question strings

    date: { type: Date, default: Date.now }
}, { timestamps: true });

// indexing to speed up queries for the dashboard
studyLogSchema.index({ user: 1, date: -1 });

const StudyLog = mongoose.model('StudyLog', studyLogSchema);
export default StudyLog;
