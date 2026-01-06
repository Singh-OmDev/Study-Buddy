import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Award, TrendingUp, AlertCircle, Share2, Download } from 'lucide-react';
import { useRef } from 'react';

const ReportCardModal = ({ isOpen, onClose, stats, userName }) => {
    if (!isOpen) return null;

    // Calculate Grades logic
    const totalHours = parseFloat(stats?.totalHours || 0);
    let grade = 'C';
    let color = 'text-yellow-500';
    let message = "Good start! Consistency is key.";

    if (totalHours > 20) {
        grade = 'S';
        color = 'text-purple-500';
        message = "Godlike performance! You are unstoppable.";
    } else if (totalHours > 10) {
        grade = 'A';
        color = 'text-green-500';
        message = "Excellent work! You are mastering your subjects.";
    } else if (totalHours > 5) {
        grade = 'B';
        color = 'text-blue-500';
        message = "Solid effort. Keep pushing for more focus time.";
    }

    // Determine strengths/weaknesses
    const subjects = Object.entries(stats?.subjectStats || {}).sort((a, b) => b[1] - a[1]);
    const topSubject = subjects.length > 0 ? subjects[0][0] : "General";

    // Suggest improvements
    const improvement = subjects.length > 1 ? subjects[subjects.length - 1][0] : "new topics";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0a0a0a] border border-[#262626] w-full max-w-md rounded-2xl overflow-hidden relative shadow-2xl"
                >
                    {/* Header with decorative pattern */}
                    <div className="h-32 bg-gradient-to-br from-[#1a1a1a] to-black relative border-b border-[#262626] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] opacity-20"></div>
                        <div className="text-center relative z-10">
                            <h2 className="text-zinc-400 text-xs font-mono tracking-widest uppercase mb-1">WEEKLY PROGRESS</h2>
                            <h1 className="text-3xl font-serif text-white font-bold">{userName}'s Report</h1>
                        </div>
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white bg-black/50 rounded-full transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Main Grade */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <p className="text-zinc-500 text-sm mb-1">Overall Grade</p>
                                <div className={`text-6xl font-black ${color} flex items-baseline gap-2 font-serif`}>
                                    {grade}<span className="text-2xl text-zinc-600 font-sans font-normal">+</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="p-4 bg-[#111111] rounded-2xl border border-[#262626]">
                                    <GraduationCap className={`h-8 w-8 ${color} mb-2 ml-auto`} />
                                    <p className="text-xs text-zinc-400">{message}</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-[#111111] rounded-xl border border-[#262626]">
                                <p className="text-zinc-500 text-xs uppercase mb-2 flex items-center gap-1">
                                    <Award className="h-3 w-3" /> Best Subject
                                </p>
                                <p className="text-white font-bold truncate">{topSubject}</p>
                            </div>
                            <div className="p-4 bg-[#111111] rounded-xl border border-[#262626]">
                                <p className="text-zinc-500 text-xs uppercase mb-2 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> Focus Hours
                                </p>
                                <p className="text-white font-bold">{totalHours} hrs</p>
                            </div>
                        </div>

                        {/* AI Comment */}
                        <div className="bg-[#111] p-4 rounded-xl border border-[#262626] mb-6 relative">
                            <div className="absolute -top-3 left-4 px-2 bg-[#0a0a0a] text-xs text-zinc-500 font-mono">
                                AI TEACHER
                            </div>
                            <p className="text-zinc-300 text-sm leading-relaxed italic font-serif">
                                "You've shown exceptional dedication in <span className="text-white not-italic">{topSubject}</span> this week.
                                To reach the next level, consider reviewing <span className="text-white not-italic">{improvement}</span> to balance your knowledge base."
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                                <Share2 className="h-4 w-4" /> Share
                            </button>
                            <button className="flex-1 py-3 bg-[#1a1a1a] text-white border border-[#333] font-medium rounded-xl hover:bg-[#262626] transition-colors flex items-center justify-center gap-2">
                                <Download className="h-4 w-4" /> Save
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReportCardModal;
