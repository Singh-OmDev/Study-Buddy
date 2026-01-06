import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, Calendar, BarChart2, Zap, Terminal, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Landing = () => {
    const { user } = useAuth();

    // Optional: If user is logged in, redirect to dashboard automatically?
    // Or keep Landing accessible? Let's keep it accessible but show a "Go to Dashboard" button.

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#262626] text-xs font-mono text-zinc-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        AI-POWERED LEARNING SYSTEM v1.0
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Master your <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">learning journey</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 leading-relaxed">
                        The all-in-one workspace for serious students. Log sessions, analyze progress,
                        and chat with an AI that remembers everything you've ever studied.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                            >
                                Go to Dashboard <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                                >
                                    Start Learning <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="w-full sm:w-auto px-8 py-4 bg-[#111111] text-white border border-[#262626] font-bold rounded-xl hover:bg-[#1a1a1a] transition-all"
                                >
                                    Log In
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Background Grid decorative */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
            </div>

            {/* Features Bento Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-8 text-center">System Capabilities</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Feature 1: Logger */}
                    <div className="bento-card p-8 md:col-span-2 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center mb-4 border border-[#262626]">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Smart Logging</h3>
                            <p className="text-zinc-400 max-w-md">
                                Don't just track time. Track *understanding*. Our structured logger asks for specific topics and confidence levels, creating a rich database of your knowledge.
                            </p>
                        </div>
                        <div className="absolute right-0 bottom-0 w-1/3 h-full bg-gradient-to-l from-[#1a1a1a] to-transparent opacity-50 group-hover:opacity-30 transition-opacity"></div>
                    </div>

                    {/* Feature 2: Analytics */}
                    <div className="bento-card p-8 flex flex-col relative overflow-hidden">
                        <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center mb-4 border border-[#262626]">
                            <BarChart2 className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Metrics</h3>
                        <p className="text-zinc-400 text-sm">
                            Visualize your subject distribution and consistency streaks on a Linear-style dashboard.
                        </p>
                    </div>

                    {/* Feature 3: AI Chat */}
                    <div className="bento-card p-8 flex flex-col relative overflow-hidden">
                        <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center mb-4 border border-[#262626]">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">RAG AI Tutor</h3>
                        <p className="text-zinc-400 text-sm">
                            Chat with your data. "What did I study last week?" Our AI scans your history to give personalized answers.
                        </p>
                    </div>

                    {/* Feature 4: Tools */}
                    <div className="bento-card p-8 md:col-span-2 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center mb-4 border border-[#262626]">
                                <Terminal className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Active Recall Tools</h3>
                            <p className="text-zinc-400 max-w-md">
                                Instantly generate summaries and quizzes from your raw notes using advanced LLMs (Llama 3).
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div className="py-20 border-t border-[#262626]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">Workflow</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { step: '01', title: 'Log Session', desc: 'Enter subject, topic, and duration.', icon: BookOpen },
                            { step: '02', title: 'AI Analysis', desc: 'Auto-summarize notes & confidence.', icon: Sparkles },
                            { step: '03', title: 'Track Data', desc: 'View analytics & streaks.', icon: BarChart2 },
                            { step: '04', title: 'Review', desc: 'Chat with history to revise.', icon: Brain },
                        ].map((item, idx) => (
                            <div key={idx} className="bento-card p-6 relative group hover:bg-[#151515] transition-colors">
                                <div className="absolute top-4 right-4 text-4xl font-bold text-[#1f1f1f] group-hover:text-[#2a2a2a] transition-colors select-none font-mono">
                                    {item.step}
                                </div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center mb-4 border border-[#262626] group-hover:border-zinc-700 transition-colors">
                                        <item.icon className="h-5 w-5 text-zinc-300 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed max-w-[90%]">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-[#262626] py-12 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-zinc-600 text-sm">© 2024 StudyBuddy AI. Built for learners.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
