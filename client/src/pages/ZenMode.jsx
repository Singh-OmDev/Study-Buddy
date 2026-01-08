import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ZenMode = () => {
    const [time, setTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(false);

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
        <div
            className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-sans text-white selection:bg-white/20"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* Animated Background - Aurora Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-transparent blur-3xl rounded-full mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        rotate: [0, -60, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
                    className="absolute top-[20%] -right-[20%] w-[100%] h-[100%] bg-gradient-to-bl from-teal-900/20 via-blue-900/20 to-transparent blur-3xl rounded-full mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, 100, 0],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[20%] left-[20%] w-[120%] h-[80%] bg-gradient-to-t from-emerald-900/10 via-transparent to-transparent blur-3xl rounded-full"
                />
            </div>

            {/* Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>


            {/* Content */}
            <div className="relative z-10 text-center flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <h1 className="text-[12rem] md:text-[20rem] font-medium leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-2xl select-none font-outfit">
                        {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="flex flex-col items-center gap-2 mt-4"
                >
                    <p className="text-2xl md:text-3xl text-white/40 font-light tracking-[0.2em] uppercase">
                        {time.toLocaleDateString(undefined, { weekday: 'long' })}
                    </p>
                    <div className="h-[1px] w-12 bg-white/20 my-2"></div>
                    <p className="text-lg md:text-xl text-white/30 font-light tracking-widest">
                        {time.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                    </p>
                </motion.div>
            </div>

            {/* Controls */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-12 flex items-center gap-4 p-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
                    >
                        <Link
                            to="/"
                            className="p-4 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
                            title="Back to Home"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <div className="w-[1px] h-8 bg-white/10"></div>
                        <button
                            onClick={toggleFullscreen}
                            className="p-4 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ZenMode;
