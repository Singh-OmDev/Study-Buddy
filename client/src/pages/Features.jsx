import { motion } from 'framer-motion';
import { BookOpen, Brain, BarChart2, Zap, Terminal, Share2, Shield, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';


const Features = () => {
    const features = [
        {
            icon: Zap,
            title: "YouTube AI Study Tool",
            description: "Master lectures in minutes. Search for specific topics directly and instantly convert any video into structured notes, flashcards, and quizzes.",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
        },
        {
            icon: Brain,
            title: "AI Brain Gap Mapping",
            description: "Stop guessing what to study. Our AI analyzes your history to visualize knowledge decay and identify gaps before they become failures.",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            icon: Share2,
            title: "Collaborative Study Pods",
            description: "Real-time P2P rooms with video chat and shared whiteboards. Study together with peer-matching or our AI fallback assistant.",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            icon: Terminal,
            title: "Personal RAG Tutor",
            description: "Chat with an AI that genuinely knows you. Using Semantic Vector Search, Agent Stark recalls every session you've ever logged.",
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/20"
        },
        {
            icon: BookOpen,
            title: "Active Recall Engine",
            description: "Instantly turn raw notes or transcripts into interactive cards. Scientific spaced repetition ensures you retain information forever.",
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20"
        },
        {
            icon: Globe,
            title: "Zen Audio Hub",
            description: "Eliminate distractions with a minimalist focus interface. Integrated Lofi streams and environmental audio for deep work.",
            color: "text-zinc-400",
            bg: "bg-zinc-400/10",
            border: "border-zinc-400/20"
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        Every tool you need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">excel in your studies.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-400 text-lg max-w-2xl mx-auto"
                    >
                        StudyBuddy isn't just another timer. It's a complete operating system for your education, powered by advanced AI.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="bg-[#111111] border border-[#262626] rounded-2xl p-8 hover:border-zinc-600 transition-colors group"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg} ${feature.border} border`}>
                                <feature.icon className={`h-6 w-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 p-12 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                    <h2 className="text-3xl font-bold text-white mb-6 relative z-10">Ready to transform your grades?</h2>
                    <div className="flex justify-center gap-4 relative z-10">
                        <Link to="/register" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                            Get Started Free <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </motion.div>
            </div>
            {/* Footer Removed - handled globally */}
        </div>
    );
};


export default Features;
