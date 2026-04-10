import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, RotateCw, Lightbulb, Check, ThumbsUp, ThumbsDown, Minus, Trophy } from 'lucide-react';

const InteractiveDeckModal = ({ cards, onClose, topic = '' }) => {
    const [deck, setDeck] = useState([]);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [scores, setScores] = useState({ easy: 0, medium: 0, hard: 0 });
    const [phase, setPhase] = useState('quiz'); // 'quiz' | 'complete'
    const [direction, setDirection] = useState(1); // for slide animation

    useEffect(() => {
        if (cards && cards.length > 0) {
            setDeck([...cards]);
        }
    }, [cards]);

    if (!deck.length) return null;

    const card = deck[index];
    const progress = ((index) / deck.length) * 100;

    const handleFlip = () => setFlipped(f => !f);

    const goNext = (rating) => {
        const newScores = { ...scores };
        if (rating) newScores[rating] = (newScores[rating] || 0) + 1;
        setScores(newScores);

        // If rated "hard", push card back into deck to repeat
        if (rating === 'hard' && index < deck.length - 1) {
            const newDeck = [...deck];
            const [removed] = newDeck.splice(index, 1);
            const insertAt = Math.min(index + 3, newDeck.length);
            newDeck.splice(insertAt, 0, removed);
            setDeck(newDeck);
        }

        setFlipped(false);
        setDirection(1);

        setTimeout(() => {
            if (index >= deck.length - 1) {
                setPhase('complete');
            } else {
                setIndex(i => i + 1);
            }
        }, 200);
    };

    const goPrev = () => {
        if (index === 0) return;
        setFlipped(false);
        setDirection(-1);
        setTimeout(() => setIndex(i => i - 1), 150);
    };

    const restartDeck = () => {
        setDeck([...cards]);
        setIndex(0);
        setFlipped(false);
        setScores({ easy: 0, medium: 0, hard: 0 });
        setPhase('quiz');
    };

    const totalAnswered = scores.easy + scores.medium + scores.hard;
    const masteryPercent = totalAnswered > 0 ? Math.round((scores.easy / totalAnswered) * 100) : 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 30 }}
                    className="w-full max-w-lg bg-[#0a0a0a] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#111]">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Flashcard Deck</p>
                            {topic && <p className="text-white font-semibold text-sm mt-0.5">{topic}</p>}
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-[#1a1a1a] text-zinc-400 hover:text-white transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {phase === 'quiz' ? (
                                <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-zinc-500">
                                            <span>Card {index + 1} of {deck.length}</span>
                                            <span className="flex gap-3">
                                                <span className="text-green-400">✓ {scores.easy}</span>
                                                <span className="text-orange-400">~ {scores.medium}</span>
                                                <span className="text-red-400">✗ {scores.hard}</span>
                                            </span>
                                        </div>
                                        <div className="h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-white rounded-full"
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Flashcard */}
                                    <div
                                        className="w-full h-52 relative perspective-1000 cursor-pointer group"
                                        onClick={handleFlip}
                                        style={{ perspective: '1000px' }}
                                    >
                                        <motion.div
                                            className="w-full h-full relative"
                                            animate={{ rotateY: flipped ? 180 : 0 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                            style={{ transformStyle: 'preserve-3d' }}
                                        >
                                            {/* Front */}
                                            <div
                                                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-zinc-700/40 flex flex-col items-center justify-center p-6 text-center"
                                                style={{ backfaceVisibility: 'hidden' }}
                                            >
                                                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                                                    <Lightbulb className="h-2.5 w-2.5" /> Question
                                                </span>
                                                <p className="text-white text-lg font-semibold leading-snug">{card.front}</p>
                                                <p className="absolute bottom-3 text-zinc-600 text-xs flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
                                                    <RotateCw className="h-3 w-3" /> Tap to reveal
                                                </p>
                                            </div>

                                            {/* Back */}
                                            <div
                                                className="absolute inset-0 rounded-2xl bg-[#0f0f0f] border border-green-500/30 flex flex-col items-center justify-center p-6 text-center overflow-hidden"
                                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                            >
                                                <div className="absolute inset-0 bg-green-500/5" />
                                                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                                                    <Check className="h-2.5 w-2.5" /> Answer
                                                </span>
                                                <p className="text-zinc-200 text-base leading-relaxed z-10">{card.back}</p>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Rating Buttons - only show after flip */}
                                    <AnimatePresence>
                                        {flipped ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="space-y-2"
                                            >
                                                <p className="text-center text-xs text-zinc-500 uppercase tracking-wider">How well did you know it?</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button
                                                        onClick={() => goNext('hard')}
                                                        className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                                                    >
                                                        <ThumbsDown className="h-4 w-4" />
                                                        <span className="text-xs font-bold">Hard</span>
                                                        <span className="text-[10px] text-red-500/70">Repeat again</span>
                                                    </button>
                                                    <button
                                                        onClick={() => goNext('medium')}
                                                        className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                        <span className="text-xs font-bold">Medium</span>
                                                        <span className="text-[10px] text-orange-500/70">Review soon</span>
                                                    </button>
                                                    <button
                                                        onClick={() => goNext('easy')}
                                                        className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all"
                                                    >
                                                        <ThumbsUp className="h-4 w-4" />
                                                        <span className="text-xs font-bold">Easy</span>
                                                        <span className="text-[10px] text-green-500/70">Got it!</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex justify-between items-center"
                                            >
                                                <button
                                                    onClick={goPrev}
                                                    disabled={index === 0}
                                                    className="p-3 rounded-full hover:bg-[#1a1a1a] text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <p className="text-zinc-600 text-xs">Tap card to reveal answer</p>
                                                <button
                                                    onClick={() => goNext(null)}
                                                    className="p-3 rounded-full hover:bg-[#1a1a1a] text-zinc-500 hover:text-white transition-colors"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                // COMPLETE SCREEN
                                <motion.div
                                    key="complete"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-5 py-4 text-center"
                                >
                                    <div className="h-16 w-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                        <Trophy className="h-8 w-8 text-yellow-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Deck Complete!</h3>
                                        <p className="text-zinc-500 text-sm mt-1">{topic}</p>
                                    </div>

                                    {/* Mastery Ring */}
                                    <div className="relative h-28 w-28">
                                        <svg className="h-28 w-28 -rotate-90" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a1a1a" strokeWidth="3" />
                                            <circle
                                                cx="18" cy="18" r="15.9" fill="none"
                                                stroke={masteryPercent >= 70 ? '#22c55e' : masteryPercent >= 40 ? '#f97316' : '#ef4444'}
                                                strokeWidth="3"
                                                strokeDasharray={`${masteryPercent} 100`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-black text-white">{masteryPercent}%</span>
                                            <span className="text-[10px] text-zinc-500 uppercase">Mastery</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 w-full text-center">
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                                            <p className="text-2xl font-bold text-green-400">{scores.easy}</p>
                                            <p className="text-xs text-zinc-500">Easy</p>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                                            <p className="text-2xl font-bold text-orange-400">{scores.medium}</p>
                                            <p className="text-xs text-zinc-500">Medium</p>
                                        </div>
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                            <p className="text-2xl font-bold text-red-400">{scores.hard}</p>
                                            <p className="text-xs text-zinc-500">Hard</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full">
                                        <button onClick={restartDeck} className="flex-1 py-3 rounded-xl border border-[#262626] text-white font-semibold hover:border-zinc-500 transition-colors flex items-center justify-center gap-2">
                                            <RotateCw className="h-4 w-4" /> Retry
                                        </button>
                                        <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors">
                                            Done
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InteractiveDeckModal;
