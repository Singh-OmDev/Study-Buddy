import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, BarChart2, Brain, LogOut, Calendar, Sparkles } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Don't show Navbar on Login/Register pages usually, or maybe yes? 
    // Let's hide it on Login/Register for cleaner look if we want, but keeping it is also fine.
    // Actually, user explicitly asked for landing page. Navbar on landing page is good.

    return (
        <nav className="bg-[#0a0a0a] border-b border-[#262626] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-transparent rounded-lg flex items-center justify-center">
                                <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">StudyBuddy</span>
                        </Link>
                    </div>

                    {user ? (
                        <>
                            <div className="hidden md:flex items-center space-x-1">
                                <NavLink to="/dashboard" text="Dashboard" />
                                <NavLink to="/focus" text="Focus" />
                                <NavLink to="/calendar" text="Calendar" />
                                <NavLink to="/log" text="Logger" />
                                <NavLink to="/chat" text="Chat" />
                                <NavLink to="/ai-revision" text="AI Tools" />
                                <NavLink to="/features" text="Features" />

                            </div>

                            <div className="flex items-center ml-4">
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                Features
                            </Link>

                            <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                Log In
                            </Link>
                            <Link to="/register" className="text-sm font-bold text-black bg-white px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors">
                                Get Started
                            </Link>
                        </div>
                    )}
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
            className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${isActive
                ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.07)] border border-white/5'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {text}
        </Link>
    );
}

export default Navbar;
