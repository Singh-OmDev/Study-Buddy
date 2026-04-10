import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Book, CheckCircle, TrendingUp, Zap, ArrowUpRight, Quote, Trash2, Users, Bell, Brain, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ReportCardModal from '../components/ReportCardModal';
import InteractiveDeckModal from '../components/InteractiveDeckModal';

const QUOTES = [
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it's done.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future depends on what you do today.",
    "Believe you can and you're halfway there.",
    "Success is the sum of small efforts, repeated day in and day out."
];

const Dashboard = () => {
    const { user, getToken } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [socket, setSocket] = useState(null);

    // Knowledge Gap Analyzer State
    const [gapData, setGapData] = useState([]);
    const [gapLoading, setGapLoading] = useState(false);
    const [showGapPanel, setShowGapPanel] = useState(false);

    // Anki Deck Modal State
    const [deckCards, setDeckCards] = useState(null);
    const [deckTopic, setDeckTopic] = useState('');
    const [deckLoading, setDeckLoading] = useState(null); // holds log._id being loaded
    
    // Notification Center State
    const [mentorRequests, setMentorRequests] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    
    const pendingMatchRef = useRef(null);
    const [timeframe, setTimeframe] = useState('this_week');
    const dailyQuote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const token = await getToken();
                const { data } = await axios.get(`/api/study/stats?timeframe=${timeframe}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, getToken, timeframe]);

    // Initialize Socket & Listeners
    useEffect(() => {
        if (!user) return;
        
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);
        
        newSocket.emit('register-user', user._id || user.id);

        newSocket.on('mentor-ping', (data) => {
            console.log("Received mentor request:", data);
            setMentorRequests(prev => {
                const idExtracted = data.roomId;
                if (!prev.find(r => r.id === idExtracted)) {
                    // Start auto-cleanup timer for 15s timeout
                    setTimeout(() => {
                         setMentorRequests(currentRequests => currentRequests.filter(r => r.id !== idExtracted));
                    }, 15000);
                    return [...prev, { ...data, id: idExtracted }];
                }
                return prev;
            });
        });

        newSocket.on('mentor-found', (data) => {
            if (pendingMatchRef.current && pendingMatchRef.current.roomId === data.roomId) {
                clearTimeout(pendingMatchRef.current.timeoutId);
                setIsWaiting(false);
                navigate(`/study-room?roomId=${data.roomId}&subject=${encodeURIComponent(pendingMatchRef.current.subject)}&buddyName=${encodeURIComponent(data.mentorName)}`);
            }
        });

        return () => newSocket.disconnect();
    }, [user, navigate]);

    // Fetch Knowledge Gaps
    const fetchGaps = async () => {
        setGapLoading(true);
        setShowGapPanel(true);
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/study/gaps', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGapData(data);
        } catch (err) {
            console.error('Failed to fetch gaps', err);
        } finally {
            setGapLoading(false);
        }
    };

    // Generate flashcards for a specific log and open the deck modal
    const handleQuizMe = async (log) => {
        if (!log.notes || log.notes.length < 10) {
            alert('This log has no notes to generate flashcards from. Add notes when you log a session!');
            return;
        }
        setDeckLoading(log._id);
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/ai/generate', {
                type: 'flashcards',
                context: log.notes
            }, { headers: { Authorization: `Bearer ${token}` } });

            // aiController always returns result as a string, parse it
            let parsed = data.result;
            if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch (e) { /* leave as-is */ }
            }
            const cards = parsed?.flashcards || (Array.isArray(parsed) ? parsed : []);
            if (cards.length === 0) {
                alert('AI could not generate flashcards. Make sure the log has detailed notes.');
                return;
            }
            setDeckTopic(`${log.topic} — ${log.subject}`);
            setDeckCards(cards);
        } catch (err) {
            console.error('Failed to generate deck', err);
            alert('Failed to generate flashcards. Please try again.');
        } finally {
            setDeckLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this log?")) return;
        try {
            const token = await getToken();
            await axios.delete(`/api/study/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistic update
            setStats(prev => ({
                ...prev,
                recentLogs: prev.recentLogs.filter(log => log._id !== id),
                totalLogs: prev.totalLogs - 1
            }));
        } catch (error) {
            console.error("Failed to delete log", error);
            alert("Failed to delete log");
        }
    };

    const handleFindBuddy = async (targetSubject = null) => {
        setIsMatching(true);
        try {
            const token = await getToken();
            const url = targetSubject ? `/api/match/find?subject=${encodeURIComponent(targetSubject)}` : '/api/match/find';
            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (data.status === 'ai_fallback') {
                navigate(`/study-room?roomId=${data.roomId}&subject=${encodeURIComponent(data.subject)}&buddyName=${encodeURIComponent(data.buddyName)}&isAi=true`);
            } else if (data.status === 'pending') {
                setIsWaiting(true);
                pendingMatchRef.current = { roomId: data.roomId, subject: data.subject };
                
                // Join room so we can hear 'mentor-found'
                if (socket) socket.emit('join-room', data.roomId);

                // Start 15s timeout
                const timeoutId = setTimeout(() => {
                     setIsWaiting(false);
                     alert("No mentors responded in time. Switching to AI Fallback!");
                     const aiRoomId = `ai_room_${user._id}_${Date.now()}`;
                     navigate(`/study-room?roomId=${aiRoomId}&subject=${encodeURIComponent(data.subject)}&buddyName=Agent%20Stark%20(AI)&isAi=true`);
                }, 15000);
                
                pendingMatchRef.current.timeoutId = timeoutId;
            } else {
                // Legacy fallback just in case
                navigate(`/study-room?roomId=${data.roomId}&subject=${encodeURIComponent(data.subject)}&buddyName=${encodeURIComponent(data.buddyName)}`);
            }
        } catch (error) {
            console.error(error);
            alert("No study buddies available at the moment. Try again later!");
        } finally {
            setIsMatching(false);
        }
    };

    if (loading) return (
        <div className="flex h-[50vh] items-center justify-center text-zinc-500 font-mono text-sm">
            LOADING_DATA...
        </div>
    );

    const chartData = stats?.subjectStats ? Object.entries(stats.subjectStats).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        minutes: value
    })) : [];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 relative">
            
            {/* PENDING MODAL */}
            <AnimatePresence>
                {isWaiting && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto"
                    >
                        <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-orange-500 animate-spin mb-6"></div>
                        <h2 className="text-2xl font-bold text-white mb-2">Pinging Available Mentors...</h2>
                        <p className="text-zinc-400">Waiting for a mentor to accept your request (15s timeout)</p>
                        <button 
                            onClick={() => {
                                clearTimeout(pendingMatchRef.current?.timeoutId);
                                setIsWaiting(false);
                            }}
                            className="mt-8 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition"
                        >
                            Cancel Request
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Minimal Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#262626] relative z-20">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-1">Dashboard</h1>
                    <p className="text-zinc-500">Overview of your learning progress.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="p-2 bg-[#111] border border-[#262626] rounded-full hover:bg-[#222] transition-colors relative shadow-xl"
                        >
                            <Bell className={`h-5 w-5 ${mentorRequests.length > 0 ? "text-orange-500" : "text-zinc-400"} transition`} />
                            {mentorRequests.length > 0 && (
                                <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.7)] border-2 border-[#111]"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotificationOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                                    className="absolute right-0 mt-3 w-80 bg-[#151515] border border-[#262626] shadow-2xl rounded-2xl overflow-hidden origin-top-right z-50"
                                >
                                    <div className="p-4 border-b border-[#262626] bg-[#1a1a1a]">
                                        <h3 className="text-white font-semibold">Incoming Requests <span className="bg-orange-500 text-black text-xs px-2 py-0.5 rounded-full ml-1">{mentorRequests.length}</span></h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-700">
                                        {mentorRequests.length === 0 ? (
                                            <p className="text-zinc-500 text-sm text-center py-8">No action currently needed.</p>
                                        ) : (
                                            mentorRequests.map(req => (
                                                <div key={req.id} className="p-3 mb-2 bg-[#222] border border-[#333] hover:border-orange-500/50 rounded-xl flex flex-col gap-2 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-8 w-8 bg-orange-500/20 rounded-full flex items-center justify-center shrink-0">
                                                            <Users className="h-4 w-4 text-orange-500" />
                                                        </div>
                                                        <p className="text-sm text-zinc-300 leading-snug">
                                                            <strong className="text-orange-400">{req.requesterName}</strong> needs your help mastering <span className="text-white font-medium">{req.subject}</span>!
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 mt-2 w-full">
                                                        <button 
                                                            onClick={() => setMentorRequests(prev => prev.filter(r => r.id !== req.id))}
                                                            className="flex-[0.5] text-xs py-2 rounded-lg bg-[#333] hover:bg-[#444] text-zinc-300 transition"
                                                        >
                                                            Ignore
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                socket?.emit('mentor-accepts', { roomId: req.roomId, mentorName: user.name || "A Mentor" });
                                                                navigate(`/study-room?roomId=${req.roomId}&subject=${encodeURIComponent(req.subject)}&buddyName=${encodeURIComponent(req.requesterName)}`);
                                                            }}
                                                            className="flex-1 text-xs py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition shadow-lg shadow-orange-500/20"
                                                        >
                                                            Accept & Enter
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button 
                        onClick={handleFindBuddy} 
                        disabled={isMatching}
                        className="px-3 py-2 bg-orange-500 text-white text-xs font-bold rounded-full hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Users className="h-4 w-4" /> {isMatching ? 'Finding...' : 'Find Study Buddy'}
                    </button>
                    <button onClick={() => setIsReportOpen(true)} className="px-3 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-zinc-200 transition-colors">
                        Get Report Card
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#262626] rounded-full">
                        <Zap className="h-4 w-4 text-orange-500 fill-orange-500" />
                        <span className="text-sm font-medium text-zinc-300">Streak: <span className="text-white">{stats?.streak || 0} Days</span></span>
                    </div>
                </div>
            </header>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Welcome Card - Spans 2 cols */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bento-card p-8 flex flex-col justify-between relative overflow-hidden group"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-zinc-500 mb-2 uppercase tracking-widest text-xs font-bold">
                            <Quote className="h-3 w-3" /> Daily Quote
                        </div>
                        <h2 className="text-xl md:text-2xl font-light italic text-white leading-relaxed mb-6">
                            "{dailyQuote}"
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-12 bg-white rounded-full"></div>
                            <p className="text-zinc-400 text-sm">
                                You've accumulated <span className="text-white font-medium">{stats?.totalHours || 0} hours</span> of focused study time.
                            </p>
                        </div>
                    </div>

                    {/* Subtle geometric decoration */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-zinc-800 to-transparent opacity-20 rounded-bl-full pointer-events-none"></div>
                </motion.div>

                {/* Quick Stat Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bento-card p-6 flex flex-col justify-between"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                            <Book className="h-4 w-4 text-zinc-400" />
                        </div>
                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Total Logs</span>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white mt-4">{stats?.totalLogs || 0}</div>
                        <div className="text-xs text-zinc-500 mt-1 flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" /> +1 this week
                        </div>
                    </div>
                </motion.div>

                {/* Chart Section - Spans 2 cols */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-2 bento-card p-6 min-h-[300px] flex flex-col"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-zinc-500 text-xs tracking-widest uppercase font-bold">Time Distribution</h3>
                        <select 
                            value={timeframe} 
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="bg-[#111] text-xs text-zinc-400 border border-[#262626] rounded-md px-2 py-1 outline-none cursor-pointer hover:text-white transition-colors"
                        >
                            <option value="this_week">This Week</option>
                            <option value="prev_week">Previous Week</option>
                            <option value="this_month">This Month</option>
                            <option value="prev_month">Previous Month</option>
                            <option value="all_time">All Time</option>
                        </select>
                    </div>

                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#525252', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#525252', fontSize: 12 }}
                                    dx={-10}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#1a1a1a' }}
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #262626', borderRadius: '8px' }}
                                />
                                <Bar dataKey="minutes" fill="#e5e5e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Remaining Stats */}
                <div className="md:col-span-1 flex flex-col gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bento-card p-6 flex flex-col items-center justify-center"
                    >
                        <div className="h-10 w-10 bg-[#222] rounded-full flex items-center justify-center mb-3">
                            <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {stats?.totalHours || 0}
                        </div>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider">Hours Focused</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bento-card p-6 flex flex-col items-center justify-center"
                    >
                        <div className="h-10 w-10 bg-[#222] rounded-full flex items-center justify-center mb-3">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {chartData.length}
                        </div>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider">Active Subjects</p>
                    </motion.div>
                </div>
            </div>

            {/* Lower Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Due for Revision (Spaced Repetition) */}
                <div className="bento-card p-6 border-orange-500/20">
                    <h3 className="text-orange-500 text-xs tracking-widest uppercase font-bold mb-4 flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Up Next For Revision
                    </h3>
                    <div className="space-y-4">
                        {!stats?.dueForRevision || stats?.dueForRevision?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                </div>
                                <p className="text-zinc-300 font-medium">You're all caught up!</p>
                                <p className="text-zinc-500 text-xs mt-1">No pending spaced repetitions.</p>
                            </div>
                        ) : (
                            stats?.dueForRevision?.map((log, index) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    key={`rev-${log._id}`} 
                                    className="flex items-center justify-between p-3 bg-[#111] hover:bg-[#151515] rounded-xl border border-[#262626] hover:border-orange-500/30 transition-colors"
                                >
                                    <div>
                                        <h4 className="text-white font-medium text-sm">{log.topic}</h4>
                                        <p className="text-zinc-500 text-xs flex items-center gap-1 mt-1">
                                            <Book className="h-3 w-3" /> {log.subject}
                                        </p>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handleQuizMe(log)}
                                            disabled={deckLoading === log._id}
                                            className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {deckLoading === log._id ? (
                                                <span className="animate-spin h-3 w-3 border border-purple-400 border-t-transparent rounded-full" />
                                            ) : (
                                                <Layers className="h-3 w-3" />
                                            )}
                                            Quiz
                                        </button>
                                        <button
                                            onClick={() => handleFindBuddy(log.subject)}
                                            disabled={isMatching}
                                            className="px-2.5 py-1.5 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Users className="h-3 w-3" /> Mentor
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Logs List */}
                <div className="bento-card p-6">
                    <h3 className="text-zinc-500 text-xs tracking-widest uppercase font-bold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {stats?.recentLogs?.length === 0 ? (
                            <p className="text-zinc-500 text-sm py-4">No recent activity. Start logging your focus sessions!</p>
                        ) : (
                            stats?.recentLogs?.map(log => (
                                <div key={log._id} className="group flex items-center justify-between p-3 hover:bg-[#1a1a1a] rounded-xl transition-colors border border-transparent hover:border-[#262626]">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-[#222] rounded-full flex flex-col items-center justify-center shrink-0">
                                            <span className="text-white font-bold leading-none">{log.durationMinutes}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase leading-none mt-1">Min</span>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium flex items-center gap-2">
                                                {log.topic}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(log.date).toLocaleDateString()}
                                                </span>
                                                {log.confidenceLevel >= 4 && (
                                                    <span className="text-xs text-green-500 bg-green-500/10 px-2 rounded">High Confidence</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleQuizMe(log)}
                                            disabled={deckLoading === log._id}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {deckLoading === log._id ? (
                                                <span className="animate-spin h-3 w-3 border border-purple-400 border-t-transparent rounded-full" />
                                            ) : (
                                                <Layers className="h-3 w-3" />
                                            )}
                                            Quiz
                                        </button>
                                        <button
                                            onClick={() => handleDelete(log._id)}
                                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Knowledge Gap Analyzer */}
            <div className="bento-card p-6 border-[#262626]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-zinc-300 text-xs tracking-widest uppercase font-bold flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-400" /> Knowledge Gap Analyzer
                    </h3>
                    <button
                        onClick={fetchGaps}
                        disabled={gapLoading}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {gapLoading ? (
                            <span className="animate-spin h-3 w-3 border border-purple-400 border-t-transparent rounded-full" />
                        ) : (
                            <Brain className="h-3 w-3" />
                        )}
                        Analyze My Brain
                    </button>
                </div>

                <AnimatePresence>
                    {showGapPanel && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 overflow-hidden"
                        >
                            {gapLoading ? (
                                <div className="flex items-center justify-center py-8 gap-3 text-zinc-500">
                                    <span className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full" />
                                    Scanning your study history...
                                </div>
                            ) : gapData.length === 0 ? (
                                <p className="text-center text-zinc-500 py-6 text-sm">No study logs found. Start logging sessions to analyze gaps!</p>
                            ) : (
                                gapData.map((item, i) => {
                                    const dangerLevel = item.weaknessScore > 20 ? 'high' : item.weaknessScore > 10 ? 'medium' : 'low';
                                    const colors = {
                                        high: { bar: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', badge: 'text-red-400 bg-red-500/10 border-red-500/20', label: '🔥 Critical' },
                                        medium: { bar: 'bg-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', badge: 'text-orange-400 bg-orange-500/10 border-orange-500/20', label: '⚠️ At Risk' },
                                        low: { bar: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: '📘 Monitor' },
                                    }[dangerLevel];
                                    const maxScore = gapData[0]?.weaknessScore || 1;
                                    const barWidth = Math.max(5, (item.weaknessScore / maxScore) * 100);

                                    return (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.07 }}
                                            className={`p-4 rounded-xl border ${colors.bg} space-y-2`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}>{colors.label}</span>
                                                        <span className="text-white font-semibold text-sm">{item.topic}</span>
                                                    </div>
                                                    <p className="text-zinc-500 text-xs mt-1">{item.subject} · {item.ageInDays}d ago · Confidence {item.confidenceLevel}/5</p>
                                                </div>
                                                <button
                                                    onClick={() => handleQuizMe(item)}
                                                    disabled={deckLoading === item._id}
                                                    className="shrink-0 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-all flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    {deckLoading === item._id ? <span className="animate-spin h-3 w-3 border border-purple-400 border-t-transparent rounded-full" /> : <Layers className="h-3 w-3" />}
                                                    Quiz
                                                </button>
                                            </div>
                                            {/* Danger score bar */}
                                            <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full ${colors.bar} rounded-full`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${barWidth}%` }}
                                                    transition={{ duration: 0.6, delay: i * 0.07 }}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ReportCardModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} stats={stats} userName={user?.name} />

            {/* Anki Interactive Deck Modal */}
            {deckCards && (
                <InteractiveDeckModal
                    cards={deckCards}
                    topic={deckTopic}
                    onClose={() => { setDeckCards(null); setDeckTopic(''); }}
                />
            )}
        </div>
    );
};

export default Dashboard;
