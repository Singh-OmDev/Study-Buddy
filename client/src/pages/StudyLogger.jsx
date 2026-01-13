import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Check, ChevronRight, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudyLogger = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth(); // Get user from context
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState(location.state?.initialTopic || '');
    const [time, setTime] = useState(location.state?.initialDuration || 45);
    const [notes, setNotes] = useState('');
    const [confidence, setConfidence] = useState(3);

    const subjects = [
        "Mathematics", "Physics", "Chemistry", "Biology",
        "History", "Computer Science", "Literature", "Economics"
    ];

    const handleSubmit = async () => {
        if (!user) {
            alert("You must be logged in to save logs.");
            return;
        }
        setLoading(true);
        try {
            await axios.post('/api/study', {
                subject,
                topic,
                durationMinutes: time,
                notes,
                confidenceLevel: confidence
            });
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
                    <span className={step >= 1 ? "text-white" : ""}>01</span>
                    <span className="text-zinc-700">/</span>
                    <span className={step >= 2 ? "text-white" : ""}>02</span>
                    <span className="text-zinc-700">/</span>
                    <span className={step >= 3 ? "text-white" : ""}>03</span>
                    <span className="text-zinc-700">/</span>
                    <span className={step >= 4 ? "text-white" : ""}>04</span>
                </div>
            </div>

            <div className="bento-card min-h-[500px] p-8 relative flex flex-col">

                {/* Step 1: Subject Selection */}
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
                                className={`col-span-2 md:col-span-4 p-4 rounded-xl bg-[#1a1a1a] border border-[#262626] focus:outline-none focus:border-white text-white placeholder-zinc-600 transition-colors ${subject && !subjects.includes(subject) ? 'border-white' : ''
                                    }`}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Topic & Time */}
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
                                type="range"
                                min="5"
                                max="180"
                                step="5"
                                value={time}
                                onChange={(e) => setTime(Number(e.target.value))}
                                className="w-full h-2 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-200"
                            />
                            <div className="flex justify-between text-xs text-zinc-600 mt-2 font-mono">
                                <span>5m</span>
                                <span>3h</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Notes */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-zinc-400 mb-1 uppercase tracking-wider">Notes</label>
                            <p className="text-zinc-600 text-xs">AI will analyze this for insights.</p>
                        </div>
                        <textarea
                            autoFocus
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="- Key concept 1&#10;- Formula learned..."
                            className="flex-1 w-full p-4 bg-[#1a1a1a] rounded-xl border border-[#262626] focus:border-white text-white placeholder-zinc-700 transition-all outline-none resize-none font-mono text-sm leading-relaxed"
                        />
                    </div>
                )}

                {/* Step 4: Confidence & Review */}
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
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Subject</span>
                                <span className="text-white">{subject}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Topic</span>
                                <span className="text-white truncate max-w-[150px]">{topic}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Duration</span>
                                <span className="text-white">{time}m</span>
                            </div>
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
                    ) : <div></div>}

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
                        className={`
                            flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all
                            ${loading || (step === 1 && !subject) || (step === 2 && !topic)
                                ? 'bg-[#262626] text-zinc-600 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-gray-200'
                            }
                        `}
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
