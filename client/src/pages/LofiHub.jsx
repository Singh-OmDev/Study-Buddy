import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Users, Headphones, Pause, Play, Volume2, VolumeX, LogOut, Link as LinkIcon, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HUB_THEMES = [
    { id: 'lofi', name: 'Lofi Beats', videoId: 'jfKfPfyJRdk', bgUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=2000&q=80' },
    { id: 'cafe', name: 'Rainy Cafe', videoId: 'lJ_0b-331u0', bgUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=2000&q=80' },
    { id: 'forest', name: 'Deep Forest', videoId: 'ipf7ifVSeDU', bgUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=2000&q=80' },
    { id: 'cyberpunk', name: 'Neon City', videoId: 'RYcaG64JkqM', bgUrl: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&w=2000&q=80' }
];

const EMOTES_LIST = ['🔥', '☕', '✨', '🧠', '💪'];

const LofiHub = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [goal, setGoal] = useState('');
    const [joined, setJoined] = useState(false);
    const [hubUsers, setHubUsers] = useState([]);
    const [timerData, setTimerData] = useState({ mode: 'focus', timeLeft: 25 * 60 });
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [activeTheme, setActiveTheme] = useState(HUB_THEMES[0]);
    const [activeEmotes, setActiveEmotes] = useState([]);
    const [copied, setCopied] = useState(false);

    const socketRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // Connect to Socket
        socketRef.current = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000");

        socketRef.current.on('hub-users-update', (users) => {
            setHubUsers(users);
        });

        socketRef.current.on('hub-timer-sync', (data) => {
            setTimerData(data);
        });

        socketRef.current.on('receive-hub-emote', (data) => {
            // data: { sourceName, targetId, emote }
            const newEmote = {
                id: Math.random().toString(),
                targetId: data.targetId,
                emote: data.emote
            };
            setActiveEmotes(prev => [...prev, newEmote]);
            
            // Auto remove emote after 3 seconds
            setTimeout(() => {
                setActiveEmotes(prev => prev.filter(e => e.id !== newEmote.id));
            }, 3000);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave-hub');
                socketRef.current.disconnect();
            }
        };
    }, []);

    const handleJoin = (e) => {
        e.preventDefault();
        if (!goal.trim()) return;

        const userData = {
            id: user?.id || Math.random().toString(),
            name: user?.firstName || 'Anonymous',
            imageUrl: user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
            goal: goal
        };

        socketRef.current.emit('join-hub', userData);
        setJoined(true);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (playerRef.current) {
            if (!isMuted) playerRef.current.setVolume(0);
            else playerRef.current.setVolume(volume);
        }
    };

    const handleVolumeChange = (e) => {
        const v = parseInt(e.target.value);
        setVolume(v);
        setIsMuted(v === 0);
        if (playerRef.current) playerRef.current.setVolume(v);
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendEmote = (targetId, emote) => {
        socketRef.current.emit('send-hub-emote', {
            sourceName: user?.firstName || 'Someone',
            targetId: targetId,
            emote: emote
        });
    };

    const playerOpts = {
        height: '1',
        width: '1',
        playerVars: {
            autoplay: 1,
            controls: 0,
            loop: 1,
            modestbranding: 1,
            playlist: activeTheme.videoId,
        },
    };

    return (
        <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans">
            
            {/* Background Image / Ambient styling */}
            <div 
                className="absolute inset-0 opacity-40 mix-blend-luminosity bg-cover bg-center transition-all duration-[3000ms]"
                style={{ backgroundImage: `url("${activeTheme.bgUrl}")` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

            {/* Hidden YT Player */}
            {joined && (
                <div className="absolute opacity-0 pointer-events-none w-px h-px overflow-hidden">
                    <YouTube
                        videoId={activeTheme.videoId}
                        opts={playerOpts}
                        onReady={(e) => {
                            playerRef.current = e.target;
                            e.target.setVolume(isMuted ? 0 : volume);
                        }}
                    />
                </div>
            )}

            {/* Top Controls */}
            {joined && (
                <>
                {/* Top Left Invite Link */}
                <div className="absolute top-6 left-6 z-50">
                    <button 
                        onClick={copyInviteLink}
                        className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/50 text-white hover:bg-black/60 transition group"
                    >
                        {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <LinkIcon className="w-5 h-5 text-zinc-400 group-hover:text-white" />}
                        <span className="text-sm font-medium hidden sm:block">{copied ? 'Copied!' : 'Invite Friend'}</span>
                    </button>
                </div>

                {/* Bottom Left Theme Switcher */}
                <div className="absolute bottom-6 left-6 z-50">
                    <div className="relative group">
                        <button className="flex items-center gap-3 bg-black/40 backdrop-blur-xl p-3 pr-4 rounded-full border border-white/10 shadow-2xl hover:bg-black/60 transition-all">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-white text-xs font-bold leading-tight">{activeTheme.name}</span>
                                <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Change Theme</span>
                            </div>
                        </button>

                        {/* Expand Upward Dropdown */}
                        <div className="absolute bottom-full left-0 mb-3 w-48 bg-zinc-900/90 backdrop-blur-2xl border border-zinc-700/50 rounded-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl origin-bottom-left scale-95 group-hover:scale-100">
                            <div className="p-2 space-y-1">
                                {HUB_THEMES.map(theme => (
                                    <button
                                        key={theme.id}
                                        onClick={() => setActiveTheme(theme)}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTheme.id === theme.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {theme.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Right Controls */}
                <div className="absolute top-6 right-6 z-50 flex items-center gap-1.5 bg-black/40 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3 px-3">
                        <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
                            {isMuted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
                        </button>
                        <input 
                            type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={handleVolumeChange}
                            className="w-20 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400"
                        />
                    </div>

                    <div className="h-10 w-px bg-white/10 mx-1"></div>
                    
                    <button 
                        onClick={() => {
                            socketRef.current.emit('leave-hub');
                            navigate('/dashboard');
                        }}
                        className="text-zinc-500 hover:text-red-400 transition-colors px-3 ml-1"
                        title="Leave Hub"
                    >
                        <LogOut className="w-5 h-5"/>
                    </button>
                </div>
                </>
            )}


            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-10 flex flex-col items-center">
                
                {!joined ? (
                    <div className="bg-black/60 backdrop-blur-xl border border-zinc-800 p-10 rounded-3xl w-full max-w-md text-center">
                        <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Headphones className="w-8 h-8 text-orange-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Global Study Hub</h1>
                        <p className="text-zinc-400 text-sm mb-8">Join the silent synchronized Pomodoro room. Music on, world off.</p>
                        
                        <form onSubmit={handleJoin} className="space-y-4">
                            <div className="text-left">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-1">What are you working on?</label>
                                <input 
                                    type="text"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="e.g. Physics Chapter 4..."
                                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition"
                                    autoFocus
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition">
                                Enter Room
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        {/* Synchronized Timer Glass Card */}
                        <div className="flex flex-col items-center mb-16 animate-in fade-in zoom-in duration-1000">
                            <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-[3rem] px-16 py-12 flex flex-col items-center shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/50 border border-white/5 text-sm text-zinc-300 font-medium mb-6 uppercase tracking-wider">
                                    <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${timerData.mode === 'focus' ? 'bg-orange-500 text-orange-500 animate-pulse' : 'bg-emerald-500 text-emerald-500'}`}></div>
                                    GLOBAL {timerData.mode === 'focus' ? 'FOCUS' : 'BREAK'}
                                </div>
                                
                                <h1 className={`text-9xl md:text-[13rem] font-black tracking-tight leading-none ${timerData.mode === 'focus' ? 'text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.2)]' : 'text-emerald-400 drop-shadow-[0_0_60px_rgba(52,211,153,0.3)]'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {formatTime(timerData.timeLeft)}
                                </h1>
                            </div>
                            <p className="text-zinc-400/80 font-mono tracking-[0.2em] text-xs uppercase mt-8">Synchronized Shift in {formatTime(timerData.timeLeft)}</p>
                        </div>

                        {/* Social Grid */}
                        <div className="w-full max-w-3xl bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    <Users className="w-5 h-5 text-zinc-400"/> 
                                    Studying Right Now
                                </h3>
                                <span className="bg-zinc-900 text-zinc-300 px-3 py-1 rounded-full text-xs font-mono">{hubUsers.length} ONLINE</span>
                            </div>

                            <div className="flex flex-wrap justify-center sm:justify-start gap-8 gap-y-12">
                                {hubUsers.map((u, i) => {
                                    // Get active emotes for THIS exact user
                                    const userEmotes = activeEmotes.filter(e => e.targetId === u.id);
                                    
                                    return (
                                    <div key={i} className="flex flex-col items-center group relative animate-in fade-in zoom-in duration-500">
                                        
                                        {/* Floating Emotes Animation Container */}
                                        <AnimatePresence>
                                            {userEmotes.map((emote) => (
                                                <motion.div
                                                    key={emote.id}
                                                    initial={{ opacity: 0, y: 0, x: '-50%', scale: 0.5 }}
                                                    animate={{ opacity: [0, 1, 0], y: -80, x: '-50%', scale: 1.5 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 2, ease: "easeOut" }}
                                                    className="absolute -top-4 left-1/2 z-50 text-3xl pointer-events-none drop-shadow-lg"
                                                >
                                                    {emote.emote}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* Tooltip & Emote Menu */}
                                        <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center z-30">
                                            <div className="bg-zinc-900 border border-zinc-700 text-white text-xs py-1.5 px-3 rounded-t-lg whitespace-nowrap hidden sm:block">
                                                Focusing on: <span className="text-emerald-300 font-semibold">{u.goal}</span>
                                            </div>
                                            {/* Emote Buttons */}
                                            {u.id !== user?.id && (
                                                <div className="bg-zinc-800 border-x border-b border-zinc-700 text-white px-2 py-1 rounded-b-lg rounded-t-lg sm:rounded-t-none flex gap-2">
                                                    {EMOTES_LIST.map(em => (
                                                        <button 
                                                            key={em} 
                                                            onClick={() => sendEmote(u.id, em)}
                                                            className="hover:scale-125 transition-transform text-base"
                                                        >{em}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-emerald-500/50 transition-colors bg-zinc-900 cursor-pointer">
                                                <img src={u.imageUrl} alt={u.name} className="w-full h-full object-cover" />
                                            </div>
                                            {/* Active indicator */}
                                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full"></div>
                                        </div>
                                        <span className="text-zinc-400 text-xs font-medium mt-3 truncate w-20 text-center">{u.name}</span>
                                    </div>
                                )})}
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default LofiHub;
