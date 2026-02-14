import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ArrowUpRight, Tag, BookOpen, Star } from 'lucide-react';

const CalendarView = () => {
    const { user, getToken } = useAuth();
    const [date, setDate] = useState(new Date());
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLogs, setSelectedLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user) return;
            try {
                const token = await getToken();
                const { data } = await axios.get('/api/study', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLogs(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch logs", error);
                setLoading(false);
            }
        };
        fetchLogs();
    }, [user, getToken]);

    useEffect(() => {
        if (logs.length > 0) {
            const filtered = logs.filter(log => {
                const logDate = new Date(log.date);
                return logDate.toDateString() === date.toDateString();
            });
            setSelectedLogs(filtered);
        } else {
            setSelectedLogs([]);
        }
    }, [date, logs]);

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const hasLog = logs.some(log => new Date(log.date).toDateString() === date.toDateString());
            if (hasLog) {
                return (
                    <div className="absolute bottom-2 w-full flex justify-center">
                        <div className="h-1 w-1 bg-white rounded-full"></div>
                    </div>
                );
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 lg:flex lg:space-x-8 lg:space-y-0 relative">

            {/* Left Column: Calendar */}
            <div className="flex-1">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#262626] mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Calendar</h1>
                        <p className="text-zinc-500">Track your consistency.</p>
                    </div>
                </header>

                <div className="bento-card p-6 min-h-[400px]">
                    <Calendar
                        onChange={setDate}
                        value={date}
                        className="w-full border-none font-sans bg-transparent text-white"
                        tileContent={tileContent}
                        tileClassName="relative h-14 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-colors text-zinc-400 focus:bg-[#262626] focus:text-white"
                        prevLabel={<span className="text-zinc-500 hover:text-white text-xl">‹</span>}
                        nextLabel={<span className="text-zinc-500 hover:text-white text-xl">›</span>}
                        prev2Label={null}
                        next2Label={null}
                    />
                    <style>{`
                        .react-calendar { background: transparent !important; color: white !important; width: 100%; border: none; }
                        .react-calendar__navigation button { color: white; min-width: 44px; background: none; font-size: 1rem; font-weight: 600; }
                        .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: #1a1a1a; rounded: 8px; }
                        .react-calendar__month-view__weekdays__weekday { color: #52525b; text-decoration: none; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
                        .react-calendar__tile--now { background: #1a1a1a !important; color: white !important; }
                        .react-calendar__tile--active { background: white !important; color: black !important; border-radius: 8px; font-weight: bold; }
                        .react-calendar__tile--active .h-1 { background-color: black !important; } 
                    `}</style>
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="lg:w-1/3 flex flex-col">
                <div className="mb-6 pb-4 border-b border-[#262626] h-[78px] flex items-end">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-zinc-500 font-mono">DATE:</span>
                        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                    </h2>
                </div>

                <div className="flex-1 space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#262626]">
                    {selectedLogs.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center bento-card border-dashed bg-transparent p-6">
                            <BookOpen className="h-8 w-8 text-zinc-700 mb-3" />
                            <p className="text-zinc-500 font-medium text-sm">No activity recorded.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {selectedLogs.map((log) => (
                                <motion.div
                                    key={log._id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bento-card p-6 group hover:border-zinc-400 transition-all duration-200"
                                >
                                    {/* Header with Subject and Difficulty */}
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{log.subject}</span>
                                        <div className="flex gap-2">
                                            {log.difficultyLevel && (
                                                <span className="text-xs px-2.5 py-1 border border-[#262626] rounded-md text-zinc-300 capitalize bg-[#0a0a0a]">
                                                    {log.difficultyLevel}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Topic - Main Focus */}
                                    <h3 className="text-white font-semibold text-lg mb-4 leading-snug">{log.topic}</h3>

                                    {/* AI Summary */}
                                    {log.aiSummary && (
                                        <div className="bg-[#0a0a0a] p-4 rounded-xl text-sm text-zinc-300 border border-[#1a1a1a] mb-4 leading-relaxed">
                                            {log.aiSummary}
                                        </div>
                                    )}

                                    {/* Metadata Footer */}
                                    <div className="flex items-center gap-4 text-sm text-zinc-400 pt-4 border-t border-[#1a1a1a]">
                                        <span className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span className="font-medium">{log.durationMinutes}m</span>
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Star className="h-4 w-4" />
                                            <span className="font-medium">{log.confidenceLevel}/5</span>
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
