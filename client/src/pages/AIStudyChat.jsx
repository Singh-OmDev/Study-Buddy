import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Sparkles, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';

const AIStudyChat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hello ${user.name}. I have access to your study logs. How can I assist you today?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/ai/generate', {
                type: 'chat',
                prompt: input
            });

            setMessages(prev => [...prev, { role: 'assistant', content: data.result }]);
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
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bento-card overflow-hidden">
            {/* Header */}
            <div className="bg-[#111111] p-4 flex items-center justify-between border-b border-[#262626]">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                        <Terminal className="h-5 w-5 text-black" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm tracking-wide uppercase">AI Tutor</h1>
                        <p className="text-zinc-500 text-xs font-mono">RAG_ENABLED: TRUE</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-zinc-500 font-mono">ONLINE</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#262626]">
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
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0 font-sans" {...props} />,
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
                        { label: "Suggest Study", prompt: "What topic should I review based on my confidence?", icon: Bot }
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
    );
};

export default AIStudyChat;
