import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ZenMode = () => {
    const [time, setTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-sans text-white animate-in fade-in duration-1000">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/10 via-transparent to-emerald-900/10 opacity-50"></div>

            {/* Breathing Circle */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[600px] h-[600px] rounded-full bg-white blur-3xl"
            />

            {/* Content */}
            <div className="relative z-10 text-center">
                <h1 className="text-[12rem] md:text-[16rem] font-bold leading-none tracking-tighter opacity-90 select-none">
                    {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                </h1>
                <p className="text-2xl text-zinc-500 font-light tracking-widest uppercase mt-4">
                    {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 flex items-center gap-6 opacity-0 hover:opacity-100 transition-opacity duration-500">
                <Link to="/" className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors backdrop-blur-sm">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <button onClick={toggleFullscreen} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors backdrop-blur-sm">
                    {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
                </button>
            </div>
        </div>
    );
};

export default ZenMode;
