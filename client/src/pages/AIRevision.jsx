import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Sparkles, Copy, Check, List, Lightbulb, History,
    X, Clock, ChevronLeft, ChevronRight, RotateCw,
    Youtube, Link, BookOpen, MessageSquare, StickyNote, Play,
    AlertCircle, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AIRevision = () => {
    const { user, getToken } = useAuth();

    // Input mode: 'youtube' | 'text'
    const [inputMode, setInputMode] = useState('youtube');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [textInput, setTextInput] = useState('');

    // output
    const [result, setResult] = useState('');
    const [videoId, setVideoId] = useState('');
    const [transcriptLength, setTranscriptLength] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // mode tabs
    const [mode, setMode] = useState('summary');

    // History
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

    useEffect(() => { fetchHistory(); }, [user]);

    const handleGenerate = async () => {
        setError('');
        setResult('');
        setVideoId('');

        if (inputMode === 'youtube') {
            if (!youtubeUrl.trim()) return;
            setLoading(true);
            try {
                const token = await getToken();
                const { data } = await axios.post('/api/ai/youtube', {
                    youtubeUrl: youtubeUrl.trim(),
                    mode
                }, { headers: { Authorization: `Bearer ${token}` } });

                setResult(data.result);
                setVideoId(data.videoId);
                setTranscriptLength(data.transcriptLength);
                fetchHistory();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to process video. Try another URL.');
            } finally {
                setLoading(false);
            }
        } else {
            if (!textInput.trim()) return;
            setLoading(true);
            try {
                const token = await getToken();
                const { data } = await axios.post('/api/ai/generate', {
                    type: mode,
                    context: textInput
                }, { headers: { Authorization: `Bearer ${token}` } });
                setResult(data.result);
                fetchHistory();
            } catch (err) {
                setError(err.response?.data?.message || 'Error generating content. Try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(typeof result === 'string' ? result : JSON.stringify(result));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) handleGenerate();
    };

    const modes = [
        { id: 'summary', label: 'Summary', icon: BookOpen },
        { id: 'key_points', label: 'Key Points', icon: List },
        { id: 'questions', label: 'Quiz', icon: MessageSquare },
        { id: 'flashcards', label: 'Flashcards', icon: StickyNote },
        { id: 'explanation', label: 'Explain', icon: Lightbulb },
    ];

    const wordCount = textInput.trim().split(/\s+/).filter(Boolean).length;

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-[#262626] pb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                            <Youtube className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">AI Tools</h1>
                    </div>
                    <p className="text-zinc-500 text-sm">
                        Paste a YouTube link → get instant study materials. No notes required.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Mode tabs */}
                    <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-[#262626] overflow-x-auto no-scrollbar">
                        {modes.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${mode === m.id
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
                        <History className="h-3 w-3" /> History
                    </button>
                </div>
            </header>

            {/* Input Mode Toggle */}
            <div className="flex items-center gap-2 p-1 bg-[#111111] rounded-xl border border-[#262626] w-fit">
                <button
                    onClick={() => setInputMode('youtube')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${inputMode === 'youtube'
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                        : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    <Youtube className="h-4 w-4" /> YouTube URL
                </button>
                <button
                    onClick={() => setInputMode('text')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${inputMode === 'text'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    <BookOpen className="h-4 w-4" /> Paste Text
                </button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: '500px' }}>

                {/* Input Column */}
                <div className="bento-card p-0 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-[#262626] bg-[#111111] flex justify-between items-center">
                        <span className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                            {inputMode === 'youtube' ? (
                                <><Youtube className="h-3 w-3 text-red-400" /> YouTube Video</>
                            ) : (
                                <><BookOpen className="h-3 w-3" /> Text Input</>
                            )}
                        </span>
                        {inputMode === 'text' && textInput && (
                            <span className="text-xs text-zinc-600">{wordCount} words</span>
                        )}
                    </div>

                    {inputMode === 'youtube' ? (
                        <div className="flex-1 flex flex-col p-6 gap-4">
                            {/* YouTube URL Input */}
                            <div>
                                <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2 block">
                                    Video URL
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 flex items-center gap-2 bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 focus-within:border-red-500/50 transition-colors">
                                        <Link className="h-4 w-4 text-zinc-600 shrink-0" />
                                        <input
                                            type="url"
                                            value={youtubeUrl}
                                            onChange={(e) => setYoutubeUrl(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Paste YouTube URL here..."
                                            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-700 focus:outline-none"
                                        />
                                        {youtubeUrl && (
                                            <button onClick={() => setYoutubeUrl('')} className="text-zinc-600 hover:text-white">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Video Preview */}
                            <AnimatePresence>
                                {videoId && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-xl overflow-hidden border border-[#262626] relative"
                                    >
                                        <img
                                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                            alt="Video thumbnail"
                                            className="w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="bg-red-500 rounded-full p-3">
                                                <Play className="h-5 w-5 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80">
                                            <p className="text-white text-xs font-mono">
                                                ✅ {transcriptLength.toLocaleString()} characters transcribed
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Example URLs */}
                            <div className="mt-auto">
                                <p className="text-xs text-zinc-600 mb-2 uppercase tracking-widest font-bold">Works with</p>
                                <div className="space-y-1.5 text-xs text-zinc-600">
                                    <p className="flex items-center gap-2"><Youtube className="h-3 w-3 text-red-500/50" /> youtube.com/watch?v=...</p>
                                    <p className="flex items-center gap-2"><Youtube className="h-3 w-3 text-red-500/50" /> youtu.be/...</p>
                                    <p className="flex items-center gap-2"><Youtube className="h-3 w-3 text-red-500/50" /> youtube.com/embed/...</p>
                                </div>
                                <p className="text-xs text-zinc-700 mt-3">
                                    💡 Video must have CC / subtitles enabled. Most educational videos do.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <textarea
                                className="flex-1 w-full bg-[#0a0a0a] p-4 text-sm text-zinc-300 font-mono resize-none focus:outline-none leading-relaxed scrollbar-thin scrollbar-thumb-[#262626]"
                                placeholder={"// Paste any text content here...\n// Textbook chapters, lecture notes, article excerpts..."}
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </>
                    )}

                    {/* Generate Button */}
                    <div className="p-4 bg-[#111111] border-t border-[#262626] flex items-center justify-between gap-3">
                        <p className="text-zinc-700 text-xs">Ctrl+Enter to generate</p>
                        <button
                            onClick={handleGenerate}
                            disabled={loading || (inputMode === 'youtube' ? !youtubeUrl.trim() : !textInput.trim())}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${loading || (inputMode === 'youtube' ? !youtubeUrl.trim() : !textInput.trim())
                                ? 'bg-[#262626] text-zinc-600 cursor-not-allowed'
                                : inputMode === 'youtube'
                                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25'
                                    : 'bg-white text-black hover:bg-zinc-200'
                                }`}
                        >
                            {loading ? (
                                <><Loader className="h-4 w-4 animate-spin" /> Processing...</>
                            ) : (
                                <><Sparkles className="h-4 w-4" /> Generate {mode.replace('_', ' ')}</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Column */}
                <div className="bento-card p-0 flex flex-col overflow-hidden relative">
                    <div className="p-3 border-b border-[#262626] bg-[#111111] flex justify-between items-center">
                        <span className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                            Output — {mode.replace('_', ' ')}
                        </span>
                        {result && (
                            <button
                                onClick={handleCopy}
                                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#262626]">
                        <AnimatePresence mode="wait">
                            {error ? (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center h-full text-center gap-3"
                                >
                                    <AlertCircle className="h-10 w-10 text-red-500/50" />
                                    <p className="text-red-400 text-sm font-medium">{error}</p>
                                    <p className="text-zinc-600 text-xs">Try a different video with subtitles enabled</p>
                                </motion.div>
                            ) : result ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {(() => {
                                        let parsedResult = result;
                                        if (mode === 'flashcards' && typeof result === 'string') {
                                            try { parsedResult = JSON.parse(result); } catch (e) { /* keep as string */ }
                                        }
                                        if (mode === 'flashcards' && typeof parsedResult === 'object' && parsedResult.flashcards) {
                                            return <FlashcardPlayer cards={parsedResult.flashcards} />;
                                        }
                                        return (
                                            <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-300 leading-7">
                                                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                                            </pre>
                                        );
                                    })()}
                                </motion.div>
                            ) : loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full gap-4 text-zinc-600"
                                >
                                    <div className="relative">
                                        <div className="h-12 w-12 rounded-full border-2 border-[#262626] animate-spin border-t-red-500" />
                                        <Youtube className="h-5 w-5 absolute inset-0 m-auto text-red-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-zinc-400">
                                            {inputMode === 'youtube' ? 'Fetching transcript...' : 'Generating...'}
                                        </p>
                                        <p className="text-xs text-zinc-600 mt-1">This may take 10–20 seconds</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    className="flex flex-col items-center justify-center h-full text-zinc-700 gap-3"
                                >
                                    <Youtube className="h-12 w-12 opacity-20" />
                                    <p className="text-sm font-mono text-center">
                                        Paste a YouTube URL and click Generate
                                    </p>
                                    <p className="text-xs text-zinc-700 text-center">
                                        Works with any video that has subtitles /<br />closed captions enabled
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
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
                            className="fixed inset-0 bg-black z-40"
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
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-[#262626]">
                                {history.length === 0 ? (
                                    <div className="text-center text-zinc-500 py-10">
                                        <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No history yet.</p>
                                    </div>
                                ) : (
                                    history.map((item) => (
                                        <div
                                            key={item._id}
                                            onClick={() => {
                                                setResult(item.result);
                                                setMode(item.type);
                                                setShowHistory(false);
                                            }}
                                            className="p-4 bg-[#111111] border border-[#262626] rounded-xl cursor-pointer hover:border-zinc-500 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-white capitalize bg-[#1a1a1a] px-2 py-1 rounded border border-[#262626]">
                                                    {item.type.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 line-clamp-2 font-mono">
                                                {item.inputContext?.startsWith('[YouTube:') ? (
                                                    <span className="text-red-400">🎥 YouTube video</span>
                                                ) : item.inputContext || 'No preview'}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const FlashcardPlayer = ({ cards }) => {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    if (!cards || cards.length === 0) return <p className="text-zinc-500 text-sm">No flashcards generated.</p>;

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
            <div className="w-full max-w-md aspect-[3/2] relative cursor-pointer" onClick={() => setFlipped(!flipped)}>
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1a1a1a] to-[#262626] border border-zinc-700/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                        <div className="absolute top-4 left-4">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold tracking-wider text-blue-400 uppercase">
                                <Lightbulb className="w-3 h-3" /> Question
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white leading-relaxed">{cards[index].front}</h3>
                        <div className="absolute bottom-4 text-zinc-600 text-xs flex items-center gap-1">
                            <RotateCw className="h-3 w-3" /> Click to flip
                        </div>
                    </div>
                    <div className="absolute inset-0 backface-hidden bg-[#0F0F0F] border border-green-500/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center rotate-y-180">
                        <div className="absolute top-4 left-4">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold tracking-wider text-green-400 uppercase">
                                <Check className="w-3 h-3" /> Answer
                            </span>
                        </div>
                        <p className="text-lg text-zinc-200 leading-7 font-medium">{cards[index].back}</p>
                    </div>
                </motion.div>
            </div>
            <div className="flex flex-col items-center gap-3 mt-6 w-full max-w-xs">
                <div className="w-full h-1 bg-[#262626] rounded-full overflow-hidden">
                    <motion.div className="h-full bg-white" animate={{ width: `${((index + 1) / cards.length) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between w-full">
                    <button onClick={handlePrev} className="p-3 rounded-full hover:bg-[#262626] text-zinc-400 hover:text-white transition-all">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="font-mono text-xs text-zinc-500 tracking-widest">CARD {index + 1} OF {cards.length}</span>
                    <button onClick={handleNext} className="p-3 rounded-full hover:bg-[#262626] text-zinc-400 hover:text-white transition-all">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIRevision;
