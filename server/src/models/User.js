import mongoose from 'mongoose';


const userSchema = mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    credits: { type: Number, default: 5 },
    plan: { type: String, enum: ['free', 'pro', 'team'], default: 'free' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
