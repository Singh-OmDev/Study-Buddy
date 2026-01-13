import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Sparkles, Terminal, Layers, Target, Lightbulb, Calendar as CalendarIcon, Search, Paperclip, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';

const AIStudyChat = () => {
    const { user, getToken } = useAuth();

    // Session State
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]); // Current messages

    // UI State
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileContext, setFileContext] = useState('');

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Fetch Session List on Mount
    const fetchSessions = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/ai/chat/sessions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(data);

            // If explicit session provided (future) or just load first
            if (data.length > 0 && !currentSessionId) {
                loadSession(data[0]._id);
            } else if (data.length === 0) {
                createNewSession();
            }
        } catch (error) {
            console.error("Failed to load sessions", error);
        }
    };

    useEffect(() => {
        if (user) fetchSessions();
    }, [user]);

    // 2. Load Specific Session
    const loadSession = async (sessionId) => {
        setLoading(true);
        setCurrentSessionId(sessionId);
        try {
            const token = await getToken();
            const { data } = await axios.get(`/api/ai/chat/${sessionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Normalize messages
            if (data && data.messages) {
                setMessages(data.messages.map(m => ({ role: m.role, content: m.content })));
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error("Failed to load session", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Create New Session
    const createNewSession = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/ai/chat/new', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(prev => [data, ...prev]);
            setCurrentSessionId(data._id);
            setMessages([{ role: 'assistant', content: `Hello ${user.name}. New chat started. How can I help?` }]);
        } catch (error) {
            console.error("Failed to create new session", error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = await getToken();
            const { data } = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setFileContext(data.text);
            setMessages(prev => [...prev, {
                role: 'system',
                content: `📄 **File Uploaded:** ${data.filename}\n\nI have read the document. You can now ask me questions about it.`
            }]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
            // Reset input so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        // If no session exists for some reason, create one first? (Should exist though)
        if (!currentSessionId) await createNewSession();

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = await getToken();
            const { data } = await axios.post('/api/ai/generate', {
                type: 'chat',
                prompt: input,
                context: fileContext,
                sessionId: currentSessionId // Pass ID
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessages(prev => [...prev, { role: 'assistant', content: data.result }]);

            // Refresh session list to update title/timestamp
            fetchSessions();

        } catch (error) {
            console.error(error);
            let errorMessage = "Connection error. Please retry.";

            if (error.response?.data?.outOfCredits) {
                errorMessage = "🛑 **Limit Reached**\n\nYou've used your free credits. [Upgrade](/pricing) for unlimited access.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex gap-4 overflow-hidden">

            {/* Sidebar (Session History) */}
            <div className="w-64 bg-[#111111] border border-[#262626] rounded-2xl flex flex-col hidden md:flex">
                <div className="p-4 border-b border-[#262626]">
                    <button
                        onClick={createNewSession}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors"
                    >
                        <Terminal className="h-4 w-4" /> New Chat
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#262626]">
                    {sessions.map(session => (
                        <button
                            key={session._id}
                            onClick={() => loadSession(session._id)}
                            className={`w-full text-left p-3 rounded-lg text-sm mb-1 transition-colors truncate ${currentSessionId === session._id
                                    ? 'bg-[#262626] text-white'
                                    : 'text-zinc-400 hover:bg-[#1a1a1a] hover:text-zinc-200'
                                }`}
                        >
                            {session.title || "New Chat"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bento-card overflow-hidden">
                {/* Header */}
                <div className="bg-[#111111] p-4 flex items-center justify-between border-b border-[#262626]">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                            <Bot className="h-5 w-5 text-black" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-sm tracking-wide uppercase">AI Tutor</h1>
                            <p className="text-zinc-500 text-xs font-mono">
                                {sessions.find(s => s._id === currentSessionId)?.title || "Start a new conversation"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-zinc-500 font-mono">ONLINE</span>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#262626]">
                    {messages.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-600 opacity-50">
                            <Sparkles className="h-12 w-12 mb-4" />
                            <p>Start a new conversation</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                {/* Avatar */}
                                <div className={`flex-shrink-0 h-8 w-8 rounded flex items-center justify-center mt-1 border ${msg.role === 'user'
                                    ? 'bg-white border-white'
                                    : 'bg-[#1a1a1a] border-[#262626]'
                                    }`}>
                                    {msg.role === 'user'
                                        ? <User className="h-5 w-5 text-black" />
                                        : <div className="font-mono font-bold text-xs text-white">AI</div>
                                    }
                                </div>

                                {/* Bubble */}
                                <div className={`p-4 rounded-lg text-sm leading-relaxed font-sans ${msg.role === 'user'
                                    ? 'bg-[#1a1a1a] text-white border border-[#262626]'
                                    : 'text-zinc-300'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <ReactMarkdown
                                            children={msg.content}
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                strong: ({ node, ...props }) => <span className="font-bold text-white" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 space-y-1 my-2" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 space-y-1 my-2" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0 font-sans whitespace-pre-wrap" {...props} />,
                                                li: ({ node, ...props }) => <li className="pl-1 font-sans" {...props} />,
                                                code: ({ node, inline, className, children, ...props }) => {
                                                    return inline ? (
                                                        <code className="bg-[#1a1a1a] px-1 py-0.5 rounded text-xs font-mono border border-[#333]" {...props}>{children}</code>
                                                    ) : (
                                                        <code className="block bg-[#1a1a1a] p-3 rounded-lg text-xs font-mono border border-[#333] my-2 overflow-x-auto" {...props}>{children}</code>
                                                    );
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start gap-4">
                            {/* Loading Indicator */}
                            <div className="flex-shrink-0 h-8 w-8 rounded bg-[#1a1a1a] border border-[#262626] flex items-center justify-center mt-1">
                                <div className="font-mono font-bold text-xs text-white">AI</div>
                            </div>
                            <div className="flex items-center gap-1 mt-3">
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#111111] border-t border-[#262626]">
                    {/* Quick Actions */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
                        {[
                            { label: "Quiz Me", prompt: "Test me on my last study session.", icon: Sparkles },
                            { label: "Progress", prompt: "Summarize what I've learned this week.", icon: Terminal },
                            { label: "Suggest Study", prompt: "What topic should I review based on my confidence?", icon: Bot },
                            { label: "Flashcards", prompt: "Create 3 key flashcards from my recent notes.", icon: Layers },
                            { label: "Find Gaps", prompt: "Analyze my history and find my weakest areas.", icon: Target },
                            { label: "Explain", prompt: "Explain the last topic I studied like I'm 5 years old.", icon: Lightbulb },
                            { label: "3-Day Plan", prompt: "Create a structured 3-day study plan covering my weak areas.", icon: CalendarIcon },
                            { label: "Deep Dive", prompt: "Pick one concept I struggled with and explain it in depth.", icon: Search }
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(action.prompt)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#262626] rounded-full text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors whitespace-nowrap"
                            >
                                <action.icon className="h-3 w-3" />
                                {action.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#262626] p-2 rounded-lg focus-within:border-zinc-500 transition-colors">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".pdf,.txt"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-[#1a1a1a] transition-colors"
                            title="Upload PDF/Notes"
                        >
                            {isUploading ? (
                                <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Paperclip className="h-4 w-4" />
                            )}
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your query..."
                            className="flex-1 bg-transparent p-2 text-white placeholder-zinc-600 focus:outline-none font-sans text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="p-2 bg-white text-black rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-zinc-700 font-mono">AI can make mistakes. Verify important info.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIStudyChat;
