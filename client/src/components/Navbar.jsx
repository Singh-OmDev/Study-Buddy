import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, BarChart2, Brain, LogOut, Calendar, Sparkles, MessageSquare, Zap, User, Menu, X } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Don't show Navbar on Login/Register pages usually, or maybe yes? 
    // Let's hide it on Login/Register for cleaner look if we want, but keeping it is also fine.
    // Actually, user explicitly asked for landing page. Navbar on landing page is good.

    const [isOpen, setIsOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

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
                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center space-x-1">
                                <NavLink to="/features" text="Features" icon={Zap} />
                                <NavLink to="/log" text="Logger" icon={BookOpen} />
                                <NavLink to="/dashboard" text="Dashboard" icon={BarChart2} />
                                <NavLink to="/focus" text="Focus" icon={Brain} />
                                <NavLink to="/calendar" text="Calendar" icon={Calendar} />
                                <NavLink to="/chat" text="Chat" icon={MessageSquare} />
                                <NavLink to="/ai-revision" text="AI Tools" icon={Sparkles} />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:block">
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                                {/* Mobile Menu Button */}
                                <div className="md:hidden flex items-center">
                                    <UserButton afterSignOutUrl="/" /> {/* Show avatar on mobile too */}
                                    <button
                                        onClick={() => setIsOpen(!isOpen)}
                                        className="ml-4 p-2 rounded-md text-zinc-400 hover:text-white hover:bg-[#262626] focus:outline-none"
                                    >
                                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/features" className="hidden sm:block text-sm font-medium text-zinc-400 hover:text-white transition-colors">
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

            {/* Mobile Menu Dropdown */}
            {isOpen && user && (
                <div className="md:hidden bg-[#0a0a0a] border-b border-[#262626]">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <MobileNavLink to="/features" text="Features" icon={Zap} />
                        <MobileNavLink to="/log" text="Logger" icon={BookOpen} />
                        <MobileNavLink to="/dashboard" text="Dashboard" icon={BarChart2} />
                        <MobileNavLink to="/focus" text="Focus" icon={Brain} />
                        <MobileNavLink to="/calendar" text="Calendar" icon={Calendar} />
                        <MobileNavLink to="/chat" text="Chat" icon={MessageSquare} />
                        <MobileNavLink to="/ai-revision" text="AI Tools" icon={Sparkles} />
                    </div>
                </div>
            )}
        </nav>
    );
};

const NavLink = ({ to, text, icon: Icon }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300 flex items-center space-x-2 ${isActive
                ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.07)] border border-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`} />}
            <span>{text}</span>
        </Link>
    );
}
const MobileNavLink = ({ to, text, icon: Icon }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3 transition-colors ${isActive
                ? 'text-white bg-[#262626]'
                : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
        >
            {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />}
            <span>{text}</span>
        </Link>
    );
};

export default Navbar;
