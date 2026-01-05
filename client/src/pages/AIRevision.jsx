import { useState } from 'react';
import axios from 'axios';
import { Sparkles, MessageSquare, BookOpen, Copy, Check, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIRevision = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('summary'); // 'summary' or 'questions'
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!input) return;
        setLoading(true);
        try {
            const { data } = await axios.post('/api/ai/generate', {
                type: mode,
                context: input
            });
            setResult(data.result);
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex items-end justify-between border-b border-[#262626] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">AI Tools</h1>
                    <p className="text-zinc-500">Generate learning materials from raw text.</p>
                </div>
                <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-[#262626]">
                    <button
                        onClick={() => setMode('summary')}
                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${mode === 'summary'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <BookOpen className="h-3 w-3" />
                        Summary
                    </button>
                    <button
                        onClick={() => setMode('questions')}
                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${mode === 'questions'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <MessageSquare className="h-3 w-3" />
                        Quiz
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
                        {result ? (
                            <div className="prose prose-invert prose-sm max-w-none font-sans text-zinc-300">
                                <pre className="whitespace-pre-wrap font-sans bg-transparent border-none p-0 m-0 text-sm leading-7">
                                    {result}
                                </pre>
                            </div>
                        ) : (
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
        </div>
    );
};

export default AIRevision;
