import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Sparkles, Copy, Check, List, Lightbulb, History,
    X, ChevronLeft, ChevronRight, RotateCw,
    Youtube, Link, BookOpen, MessageSquare, StickyNote, Play,
    AlertCircle, Loader, Search, Clock, Tv2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AIRevision = () => {
    const { user, getToken } = useAuth();

    const [inputMode, setInputMode] = useState('youtube');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [textInput, setTextInput] = useState('');

    // YouTube Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const searchDebounce = useRef(null);

    // Output
    const [result, setResult] = useState('');
    const [videoId, setVideoId] = useState('');
    const [transcriptLength, setTranscriptLength] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Mode
    const [mode, setMode] = useState('summary');

    // Flashcards
    const [flashcards, setFlashcards] = useState([]);
    const [currentCard, setCurrentCard] = useState(0);
    const [flipped, setFlipped] = useState(false);

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
        } catch (e) { console.error('History fetch failed', e); }
    };

    useEffect(() => { fetchHistory(); }, [user]);

    // ── YouTube Search ──────────────────────────────────────────────
    const handleSearch = async (q) => {
        if (!q.trim()) { setSearchResults([]); setHasSearched(false); return; }
        setSearchLoading(true);
        setSearchError('');
        setHasSearched(true);
        try {
            const token = await getToken();
            const { data } = await axios.get(`/api/ai/youtube-search?q=${encodeURIComponent(q)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(data.videos || []);
        } catch (err) {
            setSearchError(err.response?.data?.message || 'Search failed. Try pasting a URL instead.');
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchInput = (val) => {
        setSearchQuery(val);
        clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => handleSearch(val), 600);
    };

    const handleSelectVideo = (video) => {
        setSelectedVideo(video);
        setYoutubeUrl(`https://www.youtube.com/watch?v=${video.videoId}`);
        setSearchResults([]);
        setSearchQuery('');
        setHasSearched(false);
        setResult('');
        setError('');
        setVideoId('');
        setFlashcards([]);
    };

    const clearSelection = () => {
        setSelectedVideo(null);
        setYoutubeUrl('');
        setResult('');
        setError('');
        setVideoId('');
        setFlashcards([]);
    };
    // ────────────────────────────────────────────────────────────────

    const handleGenerate = async () => {
        setError('');
        setResult('');
        setVideoId('');
        setFlashcards([]);
        setCurrentCard(0);
        setFlipped(false);

        if (inputMode === 'youtube') {
            if (!youtubeUrl.trim()) return;
            setLoading(true);
            try {
                const token = await getToken();
                const { data } = await axios.post('/api/ai/youtube', {
                    youtubeUrl: youtubeUrl.trim(), mode
                }, { headers: { Authorization: `Bearer ${token}` } });

                setResult(data.result);
                setVideoId(data.videoId);
                setTranscriptLength(data.transcriptLength);

                if (mode === 'flashcards') {
                    try {
                        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
                        if (Array.isArray(parsed)) setFlashcards(parsed);
                    } catch { }
                }
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
                    type: mode, context: textInput
                }, { headers: { Authorization: `Bearer ${token}` } });
                setResult(data.result);
                if (mode === 'flashcards') {
                    try {
                        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
                        if (Array.isArray(parsed)) setFlashcards(parsed);
                    } catch { }
                }
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

    const renderFlashcards = () => {
        if (!flashcards.length) return null;
        const card = flashcards[currentCard];
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
                <p className="text-xs text-zinc-500 font-mono">{currentCard + 1} / {flashcards.length}</p>
                <div className="w-full max-w-md cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setFlipped(f => !f)}>
                    <motion.div className="relative w-full" style={{ transformStyle: 'preserve-3d', minHeight: '180px' }} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.45, ease: 'easeInOut' }}>
                        <div className="absolute inset-0 bg-[#1a1a1a] border border-[#262626] rounded-2xl flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden' }}>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Question</p>
                            <p className="text-white font-semibold text-lg leading-snug">{card?.question || card?.front || 'No question'}</p>
                            <p className="text-zinc-600 text-xs mt-4">Click to reveal answer</p>
                        </div>
                        <div className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <p className="text-xs text-zinc-400 uppercase tracking-widest mb-3">Answer</p>
                            <p className="text-black font-semibold text-lg leading-snug">{card?.answer || card?.back || 'No answer'}</p>
                        </div>
                    </motion.div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => { setCurrentCard(c => Math.max(0, c - 1)); setFlipped(false); }} disabled={currentCard === 0} className="p-2 rounded-lg border border-[#262626] text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={() => setFlipped(false)} className="p-2 rounded-lg border border-[#262626] text-zinc-400 hover:text-white transition-colors"><RotateCw className="h-4 w-4" /></button>
                    <button onClick={() => { setCurrentCard(c => Math.min(flashcards.length - 1, c + 1)); setFlipped(false); }} disabled={currentCard === flashcards.length - 1} className="p-2 rounded-lg border border-[#262626] text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                </div>
            </div>
        );
    };

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
                        Search a topic → pick a video → get instant study materials.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-[#262626] overflow-x-auto no-scrollbar">
                        {modes.map((m) => (
                            <button key={m.id} onClick={() => setMode(m.id)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${mode === m.id ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                <m.icon className="h-3 w-3" />{m.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowHistory(!showHistory)} className={`h-[34px] px-3 rounded-lg border flex items-center gap-2 text-xs font-medium transition-colors ${showHistory ? 'bg-white text-black border-white' : 'bg-[#1a1a1a] text-zinc-400 border-[#262626] hover:text-white'}`}>
                        <History className="h-3 w-3" /> History
                    </button>
                </div>
            </header>

            {/* Input Mode Toggle */}
            <div className="flex items-center gap-2 p-1 bg-[#111111] rounded-xl border border-[#262626] w-fit">
                <button onClick={() => setInputMode('youtube')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${inputMode === 'youtube' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    <Youtube className="h-4 w-4" /> YouTube URL
                </button>
                <button onClick={() => setInputMode('text')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${inputMode === 'text' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    <BookOpen className="h-4 w-4" /> Paste Text
                </button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: '520px' }}>

                {/* ── Input Column ── */}
                <div className="bento-card p-0 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-[#262626] bg-[#111111] flex justify-between items-center">
                        <span className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                            {inputMode === 'youtube' ? <><Youtube className="h-3 w-3 text-red-400" /> YouTube Video</> : <><BookOpen className="h-3 w-3" /> Text Input</>}
                        </span>
                        {inputMode === 'text' && textInput && <span className="text-xs text-zinc-600">{wordCount} words</span>}
                    </div>

                    {inputMode === 'youtube' ? (
                        <div className="flex-1 flex flex-col overflow-hidden">

                            {/* Selected video card */}
                            <AnimatePresence>
                                {selectedVideo && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="relative m-4 rounded-xl overflow-hidden border border-red-500/30 bg-[#0a0a0a] flex gap-3 p-3">
                                        <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-24 h-16 object-cover rounded-lg shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{selectedVideo.title}</p>
                                            <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1.5">
                                                <Tv2 className="h-2.5 w-2.5" />{selectedVideo.channel}
                                                {selectedVideo.duration && <><span className="text-zinc-700">·</span><Clock className="h-2.5 w-2.5" />{selectedVideo.duration}</>}
                                            </p>
                                            <span className="text-xs text-green-400 font-medium flex items-center gap-1 mt-1.5"><Check className="h-3 w-3" /> Selected</span>
                                        </div>
                                        <button onClick={clearSelection} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-zinc-400 hover:text-white transition-colors"><X className="h-3 w-3" /></button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Search & URL inputs — only when no video selected */}
                            {!selectedVideo && (
                                <div className="p-4 pb-2 space-y-3">
                                    {/* Topic search */}
                                    <div>
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2 block">🔍 Search Topic</label>
                                        <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 focus-within:border-red-500/50 transition-colors">
                                            {searchLoading ? <Loader className="h-4 w-4 text-zinc-600 shrink-0 animate-spin" /> : <Search className="h-4 w-4 text-zinc-600 shrink-0" />}
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => handleSearchInput(e.target.value)}
                                                placeholder="e.g. Newton's Laws, SQL joins, Photosynthesis..."
                                                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-700 focus:outline-none"
                                            />
                                            {searchQuery && (
                                                <button onClick={() => { setSearchQuery(''); setSearchResults([]); setHasSearched(false); }} className="text-zinc-600 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Paste URL fallback */}
                                    <div>
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Or paste URL directly</label>
                                        <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 focus-within:border-zinc-500 transition-colors">
                                            <Link className="h-4 w-4 text-zinc-600 shrink-0" />
                                            <input
                                                type="url"
                                                value={youtubeUrl}
                                                onChange={(e) => { setYoutubeUrl(e.target.value); setSelectedVideo(null); }}
                                                onKeyDown={handleKeyDown}
                                                placeholder="https://youtube.com/watch?v=..."
                                                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-700 focus:outline-none"
                                            />
                                            {youtubeUrl && <button onClick={() => setYoutubeUrl('')} className="text-zinc-600 hover:text-white"><X className="h-3.5 w-3.5" /></button>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Search results */}
                            <AnimatePresence>
                                {!selectedVideo && (searchResults.length > 0 || (hasSearched && !searchLoading)) && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-thin scrollbar-thumb-[#262626]">
                                        {searchError && <p className="text-red-400 text-xs flex items-center gap-2 py-2"><AlertCircle className="h-3.5 w-3.5" />{searchError}</p>}
                                        {!searchError && searchResults.length === 0 && hasSearched && !searchLoading && (
                                            <p className="text-zinc-600 text-xs text-center py-6">No results found. Try a different topic or paste a URL.</p>
                                        )}
                                        {searchResults.map((video, i) => (
                                            <motion.button
                                                key={video.videoId}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => handleSelectVideo(video)}
                                                className="w-full flex gap-3 p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-red-500/40 hover:bg-[#111] transition-all text-left group"
                                            >
                                                <div className="relative shrink-0">
                                                    <img src={video.thumbnail} alt={video.title} className="w-24 h-16 object-cover rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Play className="h-5 w-5 text-white fill-white" />
                                                    </div>
                                                    {video.duration && <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1 rounded">{video.duration}</span>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-xs font-semibold leading-snug line-clamp-2 group-hover:text-red-300 transition-colors">{video.title}</p>
                                                    <p className="text-zinc-500 text-xs mt-1 truncate flex items-center gap-1"><Tv2 className="h-2.5 w-2.5 shrink-0" />{video.channel}</p>
                                                    <p className="text-zinc-600 text-xs mt-1 line-clamp-1">{video.description}</p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Default state */}
                            {!selectedVideo && !hasSearched && (
                                <div className="flex-1 flex flex-col justify-end p-4">
                                    <p className="text-xs text-zinc-600 mb-2 uppercase tracking-widest font-bold">Works with</p>
                                    <div className="space-y-1.5 text-xs text-zinc-600">
                                        <p className="flex items-center gap-2"><Youtube className="h-3 w-3 text-red-500/50" /> youtube.com/watch?v=...</p>
                                        <p className="flex items-center gap-2"><Youtube className="h-3 w-3 text-red-500/50" /> youtu.be/...</p>
                                        <p className="flex items-center gap-2"><Youtube className="h-3 w-3 text-red-500/50" /> youtube.com/embed/...</p>
                                    </div>
                                    <p className="text-xs text-zinc-700 mt-3">💡 Video must have CC / subtitles enabled. Most educational videos do.</p>
                                </div>
                            )}

                            {/* Post-generate thumbnail */}
                            <AnimatePresence>
                                {videoId && selectedVideo && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-4 mb-4 rounded-xl overflow-hidden border border-[#262626] relative">
                                        <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="Video thumbnail" className="w-full object-cover" />
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80">
                                            <p className="text-white text-xs font-mono">✅ {transcriptLength.toLocaleString()} characters transcribed</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <textarea
                            className="flex-1 w-full bg-[#0a0a0a] p-4 text-sm text-zinc-300 font-mono resize-none focus:outline-none leading-relaxed scrollbar-thin scrollbar-thumb-[#262626]"
                            placeholder={"// Paste any text content here...\n// Textbook chapters, lecture notes, article excerpts..."}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
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
                            {loading ? <><Loader className="h-4 w-4 animate-spin" /> Processing...</> : <><Sparkles className="h-4 w-4" /> Generate {mode.replace('_', ' ')}</>}
                        </button>
                    </div>
                </div>

                {/* ── Output Column ── */}
                <div className="bento-card p-0 flex flex-col overflow-hidden relative">
                    <div className="p-3 border-b border-[#262626] bg-[#111111] flex justify-between items-center">
                        <span className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                            Output — {mode.replace('_', ' ')}
                        </span>
                        {result && (
                            <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors">
                                {copied ? <><Check className="h-3 w-3 text-green-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#262626] relative">
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d0d0d]">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-full border-2 border-[#262626]" />
                                    <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-t-red-500 animate-spin" />
                                </div>
                                <p className="text-zinc-500 text-sm">
                                    {selectedVideo ? `Processing "${selectedVideo.title.slice(0, 30)}..."` : 'Generating...'}
                                </p>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="p-6 flex flex-col items-center justify-center h-full text-center gap-3">
                                <AlertCircle className="h-8 w-8 text-red-500" />
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                                <p className="text-zinc-600 text-xs">Try a different video with subtitles enabled</p>
                            </div>
                        )}

                        {!loading && !error && flashcards.length > 0 && mode === 'flashcards' && renderFlashcards()}

                        {!loading && !error && result && !(flashcards.length > 0 && mode === 'flashcards') && (
                            <div className="p-5 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                            </div>
                        )}

                        {!loading && !error && !result && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-[#1a1a1a] border border-[#262626] flex items-center justify-center">
                                    <Sparkles className="h-7 w-7 text-zinc-600" />
                                </div>
                                <div>
                                    <p className="text-zinc-500 font-medium text-sm">Nothing generated yet</p>
                                    <p className="text-zinc-700 text-xs mt-1">Search for a topic or paste a URL and hit Generate</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* History Slide-over */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="fixed right-0 top-0 h-full w-[340px] bg-[#0d0d0d] border-l border-[#262626] z-50 flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-[#262626] flex items-center justify-between">
                            <h2 className="text-white font-semibold text-sm flex items-center gap-2"><History className="h-4 w-4" /> History</h2>
                            <button onClick={() => setShowHistory(false)} className="text-zinc-500 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#262626]">
                            {history.length === 0 ? (
                                <p className="text-zinc-600 text-sm text-center py-8">No history yet</p>
                            ) : (
                                history.map((item) => (
                                    <button key={item._id} onClick={() => { setResult(item.result); setShowHistory(false); }} className="w-full text-left p-3 rounded-xl bg-[#1a1a1a] border border-[#262626] hover:border-zinc-500 transition-all group">
                                        <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1">{item.type}</p>
                                        <p className="text-zinc-300 text-xs line-clamp-3 leading-relaxed group-hover:text-white transition-colors">{item.result?.slice(0, 150)}...</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIRevision;
