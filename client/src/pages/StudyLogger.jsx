import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Check, ChevronRight, Camera, FileImage, X, Loader, Scan } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createWorker } from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';

const StudyLogger = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, getToken } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // local state
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState(location.state?.initialTopic || '');
    const [time, setTime] = useState(location.state?.initialDuration || 45);
    const [notes, setNotes] = useState('');
    const [confidence, setConfidence] = useState(3);

    // OCR State
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrImage, setOcrImage] = useState(null); // preview URL
    const [ocrError, setOcrError] = useState('');
    const fileInputRef = useRef(null);

    const subjects = [
        "Mathematics", "Physics", "Chemistry", "Biology",
        "History", "Computer Science", "Literature", "Economics",
        "Operating System", "DBMS", "Linux"
    ];

    const handleScan = async (file) => {
        if (!file) return;
        setOcrError('');
        setOcrLoading(true);
        setOcrProgress(0);

        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setOcrImage(previewUrl);

        try {
            const worker = await createWorker('eng', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setOcrProgress(Math.round(m.progress * 100));
                    }
                },
            });

            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();

            const cleaned = text.trim();
            if (!cleaned || cleaned.length < 5) {
                setOcrError('Could not detect any text. Try a clearer, well-lit image.');
                setOcrImage(null);
                return;
            }

            // Append to existing notes (don't overwrite if user typed something)
            setNotes(prev => prev ? `${prev}\n\n--- Scanned ---\n${cleaned}` : cleaned);
            setOcrProgress(100);
        } catch (err) {
            console.error('OCR Error:', err);
            setOcrError('Scanning failed. Please try a different image.');
        } finally {
            setOcrLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleScan(file);
        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    const clearScan = () => {
        setOcrImage(null);
        setOcrProgress(0);
        setOcrError('');
    };

    const handleSubmit = async () => {
        if (!user) { alert("You must be logged in to save logs."); return; }
        setLoading(true);
        try {
            const token = await getToken();
            await axios.post('/api/study', {
                subject, topic, durationMinutes: time, notes, confidenceLevel: confidence
            }, { headers: { Authorization: `Bearer ${token}` } });
            navigate('/calendar');
        } catch (error) {
            console.error(error);
            alert("Failed to save. Please try logging in again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">New Entry</h1>
                    <p className="text-zinc-500">Log your progress.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-mono text-zinc-500">
                    {[1,2,3,4].map(n => (
                        <span key={n}>
                            <span className={step >= n ? "text-white" : ""}>{String(n).padStart(2,'0')}</span>
                            {n < 4 && <span className="text-zinc-700 ml-2">/</span>}
                        </span>
                    ))}
                </div>
            </div>

            <div className="bento-card min-h-[500px] p-8 relative flex flex-col">

                {/* step 1 — Subject */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
                        <label className="block text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Select Subject</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {subjects.map((sub) => (
                                <button
                                    key={sub}
                                    onClick={() => setSubject(sub)}
                                    className={`p-4 rounded-xl text-left transition-all border ${subject === sub
                                        ? 'bg-white text-black border-white font-semibold'
                                        : 'bg-[#1a1a1a] text-zinc-400 border-[#262626] hover:border-zinc-500 hover:text-white'
                                        }`}
                                >
                                    {sub}
                                </button>
                            ))}
                            <input
                                type="text"
                                placeholder="Custom Subject..."
                                value={subjects.includes(subject) ? '' : subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className={`col-span-2 md:col-span-4 p-4 rounded-xl bg-[#1a1a1a] border border-[#262626] focus:outline-none focus:border-white text-white placeholder-zinc-600 transition-colors ${subject && !subjects.includes(subject) ? 'border-white' : ''}`}
                            />
                        </div>
                    </div>
                )}

                {/* step 2 — Topic & Duration */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wider">Topic</label>
                            <input
                                autoFocus
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="What exactly did you study?"
                                className="w-full text-2xl p-4 bg-transparent border-b border-[#262626] focus:border-white text-white placeholder-zinc-700 focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider flex items-center justify-between">
                                Duration
                                <span className="text-white font-mono">{time} min</span>
                            </label>
                            <input
                                type="range" min="5" max="180" step="5" value={time}
                                onChange={(e) => setTime(Number(e.target.value))}
                                className="w-full h-2 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-white"
                            />
                            <div className="flex justify-between text-xs text-zinc-600 mt-2 font-mono">
                                <span>5m</span><span>3h</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* step 3 — Notes + OCR Scanner */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col gap-4">
                        
                        {/* OCR Card - prominent scan zone */}
                        <div className="rounded-xl border border-dashed border-orange-500/40 bg-orange-500/5 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-400 font-bold text-sm flex items-center gap-2">
                                        <Scan className="h-4 w-4" /> Handwriting Scanner (OCR)
                                    </p>
                                    <p className="text-zinc-500 text-xs mt-0.5">Upload or take a photo of your handwritten notes</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={ocrLoading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all disabled:opacity-50 shrink-0"
                                >
                                    {ocrLoading ? (
                                        <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Camera className="h-4 w-4" />
                                    )}
                                    {ocrLoading ? `${ocrProgress}%` : '📷 Scan'}
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {/* Progress Bar */}
                            <AnimatePresence>
                                {ocrLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-3 space-y-1"
                                    >
                                        <div className="flex justify-between text-xs text-zinc-500">
                                            <span>Reading handwriting...</span>
                                            <span className="text-orange-400 font-bold">{ocrProgress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-orange-500 to-orange-300 rounded-full"
                                                animate={{ width: `${ocrProgress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Success preview */}
                            <AnimatePresence>
                                {ocrImage && !ocrLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 relative rounded-lg overflow-hidden"
                                    >
                                        <img src={ocrImage} alt="Scanned" className="w-full max-h-24 object-cover opacity-50" />
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 text-green-400 text-xs font-bold">
                                            <Check className="h-4 w-4" /> Text extracted! See notes below.
                                        </div>
                                        <button onClick={clearScan} className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error */}
                            {ocrError && (
                                <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                                    <X className="h-3 w-3" /> {ocrError}
                                </p>
                            )}
                        </div>

                        {/* Manual Notes Textarea */}
                        <div className="flex flex-col flex-1 gap-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                Notes <span className="text-zinc-700 font-normal normal-case">(or scanned text will appear here)</span>
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={"- Key concept 1\n- Formula learned\n- Definition of..."}
                                className="flex-1 w-full min-h-[160px] p-4 bg-[#1a1a1a] rounded-xl border border-[#262626] focus:border-white text-white placeholder-zinc-700 transition-all outline-none resize-none font-mono text-sm leading-relaxed"
                            />
                        </div>

                        <p className="text-zinc-700 text-xs text-center">
                            💡 Detailed notes = better AI quizzes later!
                        </p>
                    </div>
                )}

                {/* step 4 — Confidence */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col items-center justify-center text-center">
                        <h2 className="text-2xl font-bold text-white mb-8">Confidence Level</h2>
                        <div className="flex gap-4 mb-12">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setConfidence(level)}
                                    className={`w-12 h-12 rounded-full font-bold transition-all border ${confidence === level
                                        ? 'bg-white text-black border-white scale-110'
                                        : 'bg-transparent text-zinc-500 border-[#262626] hover:border-zinc-500 hover:text-white'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                        <div className="w-full max-w-sm bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 text-left space-y-3">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4 tracking-widest">Summary</h3>
                            <div className="flex justify-between"><span className="text-zinc-400">Subject</span><span className="text-white">{subject}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-400">Topic</span><span className="text-white truncate max-w-[150px]">{topic}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-400">Duration</span><span className="text-white">{time}m</span></div>
                            <div className="flex justify-between"><span className="text-zinc-400">Notes</span><span className="text-white">{notes ? `${notes.length} chars` : 'None'}</span></div>
                        </div>
                    </div>
                )}

                {/* Footer / Navigation */}
                <div className="mt-8 pt-8 border-t border-[#262626] flex justify-between items-center">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="text-zinc-500 hover:text-white text-sm font-medium px-4 py-2 transition-colors"
                        >
                            Back
                        </button>
                    ) : <div />}

                    <button
                        onClick={() => {
                            if (step === 4) handleSubmit();
                            else {
                                if (step === 1 && !subject) return;
                                if (step === 2 && !topic) return;
                                setStep(s => s + 1);
                            }
                        }}
                        disabled={loading || (step === 1 && !subject) || (step === 2 && !topic)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${loading || (step === 1 && !subject) || (step === 2 && !topic)
                            ? 'bg-[#262626] text-zinc-600 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-gray-200'
                            }`}
                    >
                        {loading ? 'Saving...' : step === 4 ? 'Complete Log' : (
                            <>Next <ChevronRight className="h-4 w-4" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudyLogger;
