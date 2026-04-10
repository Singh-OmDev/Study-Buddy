import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Brain, Sparkles, Star, AlertCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SAMPLE_TOPICS = [
    'DBMS Normalization',
    'Operating System Scheduling',
    'Newton\'s Laws of Motion',
    'Demand and Supply Economics',
    'French Revolution',
    'Photosynthesis',
    'Data Structures - Linked Lists',
    'Chemical Bonding',
];

const VivaVoce = () => {
    const { getToken } = useAuth();
    const [topic, setTopic] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [phase, setPhase] = useState('setup'); // setup | listening | result

    const recognitionRef = useRef(null);
    const pulseRef = useRef(null);

    const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

    const startListening = () => {
        if (!topic.trim()) {
            setError('Please enter a topic first!');
            return;
        }
        setError('');
        setTranscript('');
        setResult(null);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setPhase('listening');
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(prev => (prev + finalTranscript) || interimTranscript);
        };

        recognition.onerror = (err) => {
            setError(`Microphone error: ${err.error}. Please allow microphone access.`);
            setIsListening(false);
            setPhase('setup');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopAndEvaluate = async () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);

        if (!transcript.trim()) {
            setError('No speech was detected. Please try again.');
            setPhase('setup');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/ai/generate', {
                type: 'viva',
                context: topic,
                prompt: transcript
            }, { headers: { Authorization: `Bearer ${token}` } });

            setResult(data.result);
            setPhase('result');

            // Read feedback aloud using browser TTS
            if (window.speechSynthesis && data.result?.feedback) {
                const utterance = new SpeechSynthesisUtterance(
                    `You scored ${data.result.score} out of 10. ${data.result.feedback}`
                );
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }
        } catch (err) {
            setError('Failed to evaluate your answer. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetViva = () => {
        setPhase('setup');
        setTranscript('');
        setResult(null);
        setError('');
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    };

    const scoreColor = (score) => {
        if (score >= 8) return 'text-green-400';
        if (score >= 5) return 'text-orange-400';
        return 'text-red-400';
    };

    const scoreBg = (score) => {
        if (score >= 8) return 'from-green-500/20 to-green-500/5 border-green-500/30';
        if (score >= 5) return 'from-orange-500/20 to-orange-500/5 border-orange-500/30';
        return 'from-red-500/20 to-red-500/5 border-red-500/30';
    };

    const getScoreMessage = (score) => {
        if (score >= 9) return '🏆 Outstanding!';
        if (score >= 7) return '🌟 Great Job!';
        if (score >= 5) return '📚 Keep Practicing!';
        return '💪 Don\'t Give Up!';
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <header className="border-b border-[#262626] pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Mic className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Viva Voce</h1>
                        <p className="text-zinc-500 text-sm">AI-powered oral exam simulator</p>
                    </div>
                </div>
            </header>

            {!isSupported && (
                <div className="bento-card p-5 border-red-500/30 bg-red-500/5 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">Speech Recognition is not supported in your browser. Please use Chrome or Edge.</p>
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* PHASE: SETUP */}
                {phase === 'setup' && (
                    <motion.div
                        key="setup"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="bento-card p-6 space-y-4">
                            <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Step 1: Enter Your Topic</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. DBMS Normalization, Newton's Laws..."
                                className="w-full bg-[#111] border border-[#262626] rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                            />
                            <div className="flex flex-wrap gap-2">
                                {SAMPLE_TOPICS.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTopic(t)}
                                        className="px-3 py-1 text-xs rounded-full bg-[#1a1a1a] border border-[#262626] text-zinc-400 hover:text-white hover:border-purple-500/50 transition-all"
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Microphone orb */}
                        <div className="bento-card p-8 flex flex-col items-center justify-center gap-6">
                            <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Step 2: Speak Your Answer</label>
                            <p className="text-zinc-400 text-sm text-center max-w-sm">
                                Press the microphone, speak your answer naturally, then press Stop when done. The AI Professor will grade you!
                            </p>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                                </div>
                            )}

                            <motion.button
                                onClick={isSupported ? startListening : undefined}
                                disabled={!isSupported || !topic.trim()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative h-28 w-28 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 shadow-2xl shadow-purple-900/50 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping opacity-75" />
                                <Mic className="h-10 w-10 text-white z-10" />
                            </motion.button>
                            <p className="text-zinc-600 text-xs">Click to start speaking</p>
                        </div>
                    </motion.div>
                )}

                {/* PHASE: LISTENING */}
                {phase === 'listening' && (
                    <motion.div
                        key="listening"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="bento-card p-8 flex flex-col items-center gap-6"
                    >
                        {/* Animated waveform */}
                        <div className="flex items-center gap-1 h-12">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 bg-purple-500 rounded-full"
                                    animate={{ height: ['8px', `${20 + Math.random() * 28}px`, '8px'] }}
                                    transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.08 }}
                                />
                            ))}
                        </div>

                        <div className="text-center">
                            <p className="text-purple-400 font-bold text-lg animate-pulse">🎙️ Listening...</p>
                            <p className="text-zinc-500 text-sm mt-1">Topic: <span className="text-white font-medium">{topic}</span></p>
                        </div>

                        {/* Live transcript */}
                        <div className="w-full bg-[#111] border border-[#262626] rounded-xl p-4 min-h-[100px] text-zinc-300 text-sm leading-relaxed font-mono">
                            {transcript || <span className="text-zinc-600 italic">Your words will appear here...</span>}
                        </div>

                        <motion.button
                            onClick={stopAndEvaluate}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-8 py-3 rounded-xl bg-white text-black font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                        >
                            <Sparkles className="h-4 w-4" />
                            Stop & Evaluate
                        </motion.button>
                    </motion.div>
                )}

                {/* PHASE: RESULT */}
                {phase === 'result' && result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Score Card */}
                        <div className={`bento-card p-8 bg-gradient-to-br border ${scoreBg(result.score)} flex flex-col items-center gap-4`}>
                            <p className="text-zinc-400 text-sm uppercase tracking-widest font-bold">Your Score</p>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                                className={`text-8xl font-black ${scoreColor(result.score)}`}
                            >
                                {result.score}
                                <span className="text-3xl text-zinc-500">/10</span>
                            </motion.div>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${i < Math.round(result.score / 2) ? scoreColor(result.score) : 'text-zinc-700'}`}
                                        fill={i < Math.round(result.score / 2) ? 'currentColor' : 'none'}
                                    />
                                ))}
                            </div>
                            <p className="text-xl font-bold text-white">{getScoreMessage(result.score)}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${result.score >= 8 ? 'bg-green-500/10 border-green-500/30 text-green-400' : result.score >= 5 ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                {result.grade}
                            </span>
                        </div>

                        {/* Feedback */}
                        <div className="bento-card p-6 space-y-3">
                            <h3 className="text-sm text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
                                <Brain className="h-4 w-4" /> Professor's Feedback
                            </h3>
                            <p className="text-zinc-300 leading-relaxed">{result.feedback}</p>
                        </div>

                        {/* Missed Keywords */}
                        {result.missed_keywords?.length > 0 && (
                            <div className="bento-card p-6 space-y-3">
                                <h3 className="text-sm text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-400" /> Keywords You Missed
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.missed_keywords.map((kw, i) => (
                                        <span key={i} className="px-3 py-1 text-sm rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 font-medium">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Your Answer */}
                        <div className="bento-card p-6 space-y-3">
                            <h3 className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Your Spoken Answer</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed font-mono bg-[#111] p-4 rounded-lg border border-[#262626]">
                                "{transcript}"
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={resetViva}
                                className="flex-1 py-3 rounded-xl bg-[#1a1a1a] border border-[#262626] text-white font-semibold flex items-center justify-center gap-2 hover:border-zinc-500 transition-colors"
                            >
                                <RotateCcw className="h-4 w-4" /> Try Again
                            </button>
                            <button
                                onClick={() => { setPhase('listening'); startListening(); }}
                                className="flex-1 py-3 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                            >
                                Next Attempt <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Loading */}
                {loading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bento-card p-12 flex flex-col items-center gap-4"
                    >
                        <div className="h-12 w-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                        <p className="text-zinc-400 text-sm">Professor is evaluating your answer...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VivaVoce;
