import { motion } from 'framer-motion';
import { BookOpen, Brain, BarChart2, Zap, Terminal, Share2, Shield, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';


const Features = () => {
    const features = [
        {
            icon: BookOpen,
            title: "Smart Logging System",
            description: "Go beyond simple time tracking. Log your confidence levels, notes, and mood to build a comprehensive map of your knowledge.",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            icon: Brain,
            title: "RAG AI Tutor",
            description: "Chat with an AI that remembers everything you've ever studied. Ask questions based on your own past notes and sessions.",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            icon: BarChart2,
            title: "Analytics Dashboard",
            description: "Visualize your progress with linear-style graphs. Track your study streaks, subject distribution, and focus hours.",
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/20"
        },
        {
            icon: Zap,
            title: "Focus Mode",
            description: "Eliminate distractions with our built-in Pomodoro timer and blocking tools. Deep work made easy.",
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20"
        },
        {
            icon: Terminal,
            title: "Active Recall Generator",
            description: "Instantly turn your notes into quizzes and flashcards. The most effective way to learn, automated.",
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20"
        },
        {
            icon: Share2,
            title: "Social Accountability",
            description: "Share your progress with friends. Compete on leaderboards or just keep each other motivated.",
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            border: "border-pink-500/20"
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
