import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Book, CheckCircle, TrendingUp, Zap, ArrowUpRight, Quote, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ReportCardModal from '../components/ReportCardModal';

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
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const dailyQuote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return; // Wait for user to be loaded
            try {
                const token = await getToken();
                const { data } = await axios.get('/api/study/stats', {
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
    }, [user, getToken]);

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
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Minimal Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#262626]">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-1">Dashboard</h1>
                    <p className="text-zinc-500">Overview of your learning progress.</p>
                </div>
                <div className="flex items-center gap-3">
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
                    className="md:col-span-2 bento-card p-6 min-h-[300px]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Time Distribution</h3>
                        <select className="bg-transparent text-xs text-zinc-500 border-none outline-none cursor-pointer hover:text-white transition-colors">
                            <option>This Week</option>
                        </select>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#52525b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#52525b', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#1f1f1f' }}
                                    contentStyle={{
                                        backgroundColor: '#0a0a0a',
                                        borderRadius: '8px',
                                        border: '1px solid #262626',
                                        color: '#fff',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                                    }}
                                />
                                <Bar
                                    dataKey="minutes"
                                    fill="#e4e4e7"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
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
                        className="bento-card p-6 flex-1 flex flex-col justify-center items-center text-center group hover:bg-[#171717]"
                    >
                        <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center mb-4 group-hover:border-zinc-700 transition-colors">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.totalHours || 0}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Hours Focused</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bento-card p-6 flex-1 flex flex-col justify-center items-center text-center group hover:bg-[#171717]"
                    >
                        <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center mb-4 group-hover:border-zinc-700 transition-colors">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-white">{chartData.length}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Active Subjects</div>
                    </motion.div>
                </div>

                {/* Recent Activity Card - Spans 3 cols (Full Width) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="md:col-span-3 bento-card p-6"
                >
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {stats?.recentLogs?.length > 0 ? (
                            stats.recentLogs.map((log) => (
                                <div key={log._id} className="flex items-center justify-between p-3 bg-[#111111] border border-[#262626] rounded-lg group hover:border-zinc-700 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium text-sm">{log.topic}</h4>
                                            <p className="text-zinc-500 text-xs">
                                                {log.subject} • {new Date(log.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-white font-mono text-sm">{log.durationMinutes}m</span>
                                        <button
                                            onClick={() => handleDelete(log._id)}
                                            className="p-2 text-zinc-600 hover:text-red-500 hover:bg-zinc-900 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Log"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-zinc-600 text-sm">No study logs yet. Start focusing!</div>
                        )}
                    </div>
                </motion.div>

            </div>
            <ReportCardModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} stats={stats} userName={user?.name} />
        </div>
    );
};

export default Dashboard;
