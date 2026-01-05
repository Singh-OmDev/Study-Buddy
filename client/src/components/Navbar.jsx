import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, BarChart2, Brain, LogOut, Calendar, Sparkles } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    if (!user) return null;

    return (
        <nav className="bg-[#0a0a0a] border-b border-[#262626] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-black" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">StudyBuddy</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        <NavLink to="/" text="Dashboard" />
                        <NavLink to="/calendar" text="Calendar" />
                        <NavLink to="/log" text="Logger" />
                        <NavLink to="/chat" text="Chat" />
                        <NavLink to="/ai-revision" text="AI Tools" />
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={logout}
                            className="ml-4 text-xs font-medium text-zinc-500 hover:text-white transition-colors border border-zinc-800 rounded-md px-3 py-1.5 hover:border-zinc-600"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, text }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${isActive
                    ? 'text-white bg-[#1a1a1a]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#111111]'
                }`}
        >
            {text}
        </Link>
    );
}

export default Navbar;
