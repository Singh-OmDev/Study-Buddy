import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, Calendar, BarChart2, Zap, Terminal, Sparkles, Clock, Github, Twitter, Linkedin, Instagram } from 'lucide-react';
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

                    <div className="mt-8 animate-in fade-in delay-500">
                        <Link to="/zen" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium border-b border-transparent hover:border-zinc-500 pb-0.5">
                            <Clock className="h-4 w-4" /> Enter Zen Mode
                        </Link>
                    </div>
                </div>

                {/* Background Grid decorative */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
            </div>

            {/* Features Bento Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-10 text-center">System Capabilities</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Feature 1: Logger */}
                    <div className="bento-card p-8 md:col-span-2 relative overflow-hidden group hover:border-zinc-600 transition-colors">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-[#1a1a1a] rounded-xl flex items-center justify-center mb-6 border border-[#262626] group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <BookOpen className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Smart Logging</h3>
                            <p className="text-zinc-400 text-lg max-w-lg leading-relaxed">
                                Track <span className="text-white font-semibold">understanding</span>, not just time. Our structured logger captures your confidence levels, building a true map of your knowledge.
                            </p>
                        </div>
                        <div className="absolute right-0 bottom-0 w-1/3 h-full bg-gradient-to-l from-[#1a1a1a] to-transparent opacity-50 group-hover:opacity-30 transition-opacity"></div>
                    </div>

                    {/* Feature 2: Analytics */}
                    <div className="bento-card p-8 flex flex-col relative overflow-hidden group hover:border-zinc-600 transition-colors">
                        <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center mb-4 border border-[#262626] group-hover:rotate-6 transition-transform duration-300">
                            <BarChart2 className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Metrics</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Visualize subject mastery and streaks on a Linear-style dashboard.
                        </p>
                    </div>

                    {/* Feature 3: AI Chat */}
                    <div className="bento-card p-8 flex flex-col relative overflow-hidden group hover:border-zinc-600 transition-colors">
                        <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center mb-4 border border-[#262626] group-hover:scale-110 transition-transform duration-300">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">RAG AI Tutor</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            "What did I study last week?" Chat with an AI that knows your entire history.
                        </p>
                    </div>

                    {/* Feature 4: Tools */}
                    <div className="bento-card p-8 md:col-span-2 relative overflow-hidden group hover:border-zinc-600 transition-colors">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-[#1a1a1a] rounded-xl flex items-center justify-center mb-6 border border-[#262626] group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Terminal className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Active Recall Tools</h3>
                            <p className="text-zinc-400 text-lg max-w-lg leading-relaxed">
                                Turn notes into power. Instantly generate summaries and quizzes from raw text using advanced LLMs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Value Proposition */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-[#262626]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            THE PROBLEM
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            Stop losing track of <br />
                            <span className="text-zinc-500">your hard work.</span>
                        </h2>
                        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                            Most students forget 70% of what they learn within 24 hours. Without tracking and active recall, your study sessions are just fleeting moments.
                        </p>
                        <div className="space-y-4">
                            {[
                                "Scattered notes across completely different apps",
                                "No idea which subjects are falling behind",
                                "Studying inefficiently without focus tools"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-zinc-500">
                                    <div className="min-w-[6px] h-[6px] bg-zinc-700 rounded-full" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#262626] rounded-2xl p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-3xl rounded-full pointer-events-none"></div>

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-mono text-green-400 mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping absolute opacity-75"></span>
                            </span>
                            THE SOLUTION
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-8">The Intelligent Way</h3>
                        <ul className="space-y-6">
                            {[
                                { text: "AI instantly analyzes your knowledge gaps", icon: Brain },
                                { text: "Visual dashboards keep you accountable", icon: BarChart2 },
                                { text: "Focus modes maximize deep work blocks", icon: Zap }
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4 text-zinc-200">
                                    <div className="p-2 rounded-lg bg-[#1a1a1a] border border-[#262626] text-green-500">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span className="py-2 text-lg">{item.text}</span>
                                </li>
                            ))}
                        </ul>
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
                                    <p className="text-zinc-400 text-sm leading-relaxed max-w-[90%]">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-[#262626] bg-[#050505] pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-black" />
                                </div>
                                <span className="text-xl font-bold text-white tracking-tight">StudyBuddy</span>
                            </div>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-xs">
                                Empowering students with AI-driven insights for smarter, deeper, and more efficient learning.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                                <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Github className="h-5 w-5" /></a>
                                <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
                                <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-4">Product</h3>
                            <ul className="space-y-2 text-sm text-zinc-500">
                                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link to="/zen" className="hover:text-white transition-colors">Zen Mode</Link></li>
                                <li><Link to="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-4">Resources</h3>
                            <ul className="space-y-2 text-sm text-zinc-500">
                                <li><Link to="/blog" className="hover:text-white transition-colors">Study Tips</Link></li>
                                <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
                                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-4">Legal</h3>
                            <ul className="space-y-2 text-sm text-zinc-500">
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-zinc-600 text-sm">© 2026 StudyBuddy AI. Built for learners.</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            All Systems Normal
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default Landing;
