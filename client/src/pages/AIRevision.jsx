import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, MessageSquare, BookOpen, Copy, Check, Terminal, List, StickyNote, Lightbulb, History, X, Clock, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';

const AIRevision = () => {
    const { user, getToken } = useAuth();
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('summary'); // 'summary' | 'questions' | 'key_points' | 'flashcards' | 'explanation'
    const [copied, setCopied] = useState(false);

    // History State
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);

    const fetchHistory = async () => {
        if (!user) return;
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/ai/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    // Fetch history on mount and when opening history
    useEffect(() => {
        fetchHistory();
    }, [user]);

    const handleGenerate = async () => {
        if (!input) return;
        setLoading(true);
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/ai/generate', {
                type: mode,
                context: input
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(data.result);
            fetchHistory(); // Refresh history after generation
        } catch (error) {
            console.error(error);
            setResult(error.response?.data?.message || "Error generating content. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const modes = [
        { id: 'summary', label: 'Summary', icon: BookOpen },
        { id: 'key_points', label: 'Key Points', icon: List },
        { id: 'questions', label: 'Quiz', icon: MessageSquare },
        { id: 'flashcards', label: 'Flashcards', icon: StickyNote },
        { id: 'explanation', label: 'Explain', icon: Lightbulb },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-[#262626] pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">AI Tools</h1>
                    <p className="text-zinc-500">Transform your notes into study materials.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-[#262626] overflow-x-auto no-scrollbar">
                        {modes.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${mode === m.id
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                <m.icon className="h-3 w-3" />
                                {m.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`h-[34px] px-3 rounded-lg border flex items-center gap-2 text-xs font-medium transition-colors ${showHistory ? 'bg-white text-black border-white' : 'bg-[#1a1a1a] text-zinc-400 border-[#262626] hover:text-white'}`}
                    >
                        <History className="h-4 w-4" />
                        History
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">

                {/* Input Column */}
                <div className="bento-card p-0 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-[#262626] bg-[#111111] flex justify-between items-center">
                        <span className="text-xs font-mono text-zinc-500 uppercase">Input Source</span>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#262626]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#262626]"></div>
                        </div>
                    </div>
                    <textarea
                        className="flex-1 w-full bg-[#0a0a0a] p-4 text-sm text-zinc-300 font-mono resize-none focus:outline-none leading-relaxed scrollbar-thin scrollbar-thumb-[#262626]"
                        placeholder="// Paste your notes here..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="p-4 bg-[#111111] border-t border-[#262626] flex justify-end">
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !input}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                                ${loading || !input
                                    ? 'bg-[#262626] text-zinc-600 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-zinc-200'
                                }
                            `}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin h-3 w-3 border-2 border-zinc-400 border-t-transparent rounded-full"></span>
                                    Processing
                                </span>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Column */}
                <div className="bento-card p-0 flex flex-col overflow-hidden relative">
                    <div className="p-3 border-b border-[#262626] bg-[#111111] flex justify-between items-center">
                        <span className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                            <Terminal className="h-3 w-3" />
                            Output
                        </span>
                        {result && (
                            <button
                                onClick={handleCopy}
                                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 bg-[#1a1a1a] p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#262626]">
                        {result ? (() => {
                            let parsedResult = result;
                            if (mode === 'flashcards' && typeof result === 'string') {
                                try {
                                    parsedResult = JSON.parse(result);
                                } catch (e) {
                                    // Keep as string if parsing fails
                                }
                            }

                            return mode === 'flashcards' && typeof parsedResult === 'object' && parsedResult.flashcards ? (
                                <FlashcardPlayer cards={parsedResult.flashcards} />
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none font-sans text-zinc-300">
                                    <pre className="whitespace-pre-wrap font-sans bg-transparent border-none p-0 m-0 text-sm leading-7">
                                        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                                    </pre>
                                </div>
                            );
                        })() : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-700 opacity-50">
                                <Terminal className="h-12 w-12 mb-4" />
                                <p className="text-sm font-mono">Waiting for input...</p>
                            </div>
                        )}
                    </div>

                    {/* Retro Scanline Effect (Optional, kept subtle) */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
                </div>
            </div>


            {/* History Slide-over */}
            <AnimatePresence>
                {showHistory && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-[#262626] z-50 p-6 flex flex-col shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <History className="h-5 w-5" /> History
                                </h2>
                                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-[#1a1a1a] rounded-full text-zinc-400 hover:text-white transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-[#262626]">
                                {history.length === 0 ? (
                                    <div className="text-center text-zinc-500 py-10">
                                        <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p>No history yet.</p>
                                    </div>
                                ) : (
                                    history.map((item) => (
                                        <div
                                            key={item._id}
                                            onClick={() => {
                                                setResult(JSON.parse(JSON.stringify(item.result))); // Ensure string/object is handled
                                                setInput(item.inputContext || "");
                                                setMode(item.type);
                                                setShowHistory(false);
                                            }}
                                            className="p-4 bg-[#111111] border border-[#262626] rounded-lg cursor-pointer hover:border-zinc-500 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-white capitalize bg-[#1a1a1a] px-2 py-1 rounded border border-[#262626]">{item.type.replace('_', ' ')}</span>
                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-400 line-clamp-2 font-mono">
                                                {item.inputContext ? item.inputContext : "No context"}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div >
    );
};

const FlashcardPlayer = ({ cards }) => {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    if (!cards || cards.length === 0) return <p>No flashcards generated.</p>;

    const handleNext = () => {
        setFlipped(false);
        setTimeout(() => setIndex((prev) => (prev + 1) % cards.length), 300);
    };

    const handlePrev = () => {
        setFlipped(false);
        setTimeout(() => setIndex((prev) => (prev - 1 + cards.length) % cards.length), 300);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md aspect-[3/2] relative perspective-1000 group cursor-pointer" onClick={() => setFlipped(!flipped)}>
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    {/* Front: Question */}
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1a1a1a] to-[#262626] border border-zinc-700/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-2xl shadow-black/50">
                        <div className="absolute top-4 left-4">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold tracking-wider text-blue-400 uppercase">
                                <Lightbulb className="w-3 h-3" /> Question
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white leading-relaxed">{cards[index].front}</h3>

                        <div className="absolute bottom-6 flex items-center gap-2 text-zinc-500 text-xs font-mono opacity-50 group-hover:opacity-100 transition-opacity">
                            <RotateCw className="h-3 w-3" />
                            Click to reveal
                        </div>
                    </div>

                    {/* Back: Answer */}
                    <div className="absolute inset-0 backface-hidden bg-[#0F0F0F] border border-green-500/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-2xl shadow-green-900/10 rotate-y-180 relative overflow-hidden">
                        {/* Decorative Background Glow */}
                        <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />

                        <div className="absolute top-4 left-4">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold tracking-wider text-green-400 uppercase">
                                <Check className="w-3 h-3" /> Answer
                            </span>
                        </div>

                        <p className="text-lg text-zinc-200 leading-7 font-medium z-10">{cards[index].back}</p>
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-xs">
                {/* Progress Bar */}
                <div className="w-full h-1 bg-[#262626] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${((index + 1) / cards.length) * 100}%` }}
                    />
                </div>

                <div className="flex items-center justify-between w-full">
                    <button onClick={handlePrev} className="p-3 rounded-full hover:bg-[#262626] text-zinc-400 hover:text-white transition-all active:scale-95">
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <span className="font-mono text-xs text-zinc-500 tracking-widest">
                        CARD {index + 1} OF {cards.length}
                    </span>

                    <button onClick={handleNext} className="p-3 rounded-full hover:bg-[#262626] text-zinc-400 hover:text-white transition-all active:scale-95">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIRevision;
