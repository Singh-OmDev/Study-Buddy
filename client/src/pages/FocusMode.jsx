import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { Play, Pause, RotateCcw, CheckCircle, Timer as TimerIcon, Coffee, Headphones, CloudRain, Waves, VolumeX as Mute, Music, Zap, Trees, Volume2, Sun, Radio, Sparkles, Flame, Moon, Droplets, Brain, Target } from 'lucide-react';

// Music Stations Configuration
const stations = [
    { id: 'none', label: 'Silent', icon: Mute, modes: ['focus', 'break'] },
    { id: 'lofi', label: 'Lofi Girl', icon: Headphones, videoId: 'jfKfPfyJRdk', modes: ['focus', 'break'] },
    { id: 'piano', label: 'Calm Piano', icon: Moon, videoId: 'tNkZsRW7h2c', modes: ['focus', 'break'] },
    { id: 'rain', label: 'Rainy Window', icon: CloudRain, videoId: 'q76bMs-NwRk', modes: ['focus', 'break'] },
    { id: 'forest', label: 'Nature', icon: Trees, videoId: 'ipf7ifVSeDU', modes: ['focus', 'break'] },
    { id: 'ambient', label: 'Ambient', icon: Waves, videoId: 's1jWbI_C4yM', modes: ['focus', 'break'] },

    { id: 'deep', label: 'Deep Work', icon: Target, videoId: 'RYcaG64JkqM', modes: ['focus'] },
    // Break Specific
    { id: 'jazz', label: 'Cafe Jazz', icon: Coffee, videoId: 'lJ_0b-331u0', modes: ['break'] },
    { id: 'upbeat', label: 'Energy', icon: Sun, videoId: 'F0G2Q1x4K1c', modes: ['break'] },
];

const FocusMode = () => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // 'focus' or 'break'
    const [sessionCount, setSessionCount] = useState(0);
    const [musicMode, setMusicMode] = useState('none');
    const [focusGoal, setFocusGoal] = useState('');
    const [volume, setVolume] = useState(50);
    const [prevVolume, setPrevVolume] = useState(50);
    const [playerStatus, setPlayerStatus] = useState(-1); // -1: unstarted
    const playerRef = useRef(null);
    const intervalRef = useRef(null);

    // Reset player ref when music mode changes
    useEffect(() => {
        playerRef.current = null;
    }, [musicMode]);

    // Update volume when state changes
    useEffect(() => {
        const player = playerRef.current;
        if (player && typeof player.setVolume === 'function') {
            try {
                // Ensure the player is actually ready
                if (typeof player.getIframe === 'function' && player.getIframe()) {
                    player.setVolume(volume);
                }
            } catch (error) {
                console.warn("YouTube Player Error (setVolume):", error);
            }
        }
    }, [volume]);

    const toggleMute = () => {
        const player = playerRef.current;
        if (volume > 0) {
            setPrevVolume(volume);
            setVolume(0);
            if (player && typeof player.setVolume === 'function') player.setVolume(0);
        } else {
            const newVol = prevVolume > 0 ? prevVolume : 50;
            setVolume(newVol);
            if (player && typeof player.setVolume === 'function') player.setVolume(newVol);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const switchMode = (newMode) => {
        setIsActive(false);
        setMode(newMode);
        setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const handleFinishSession = () => {
        // Calculate duration based on sessions completed or time elapsed
        let duration = 25; // Default reference
        if (sessionCount > 0) {
            duration = sessionCount * 25;
        } else {
            // If logging early without finishing a full session, calculate elapsed minutes
            const elapsed = Math.max(1, Math.round((25 * 60 - timeLeft) / 60));
            duration = elapsed;
        }

        navigate('/log', { state: { initialDuration: duration, initialTopic: focusGoal } });
    };

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 0) {
                        clearInterval(intervalRef.current);
                        setIsActive(false);
                        if (mode === 'focus') {
                            setSessionCount(prev => prev + 1);
                            // Optional: Play sound here
                        }
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, mode]);

    // Calculate progress for circular ring
    const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    const currentStation = stations.find(s => s.id === musicMode);

    // Memoize options to prevent player re-renders on timer ticks
    const playerOpts = useMemo(() => ({
        height: '1',
        width: '1',
        // host: 'https://www.youtube-nocookie.com', // Using default host to reduce CORS issues
        playerVars: {
            autoplay: 1,
            controls: 0,
            loop: 1,
            modestbranding: 1,
            playlist: currentStation?.videoId,
        },
    }), [currentStation?.videoId]);

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="bento-card p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden">


                {/* Background decorative glow */}
                <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${isActive ? 'bg-green-500' : 'bg-transparent'}`}></div>

                {/* Header */}
                <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Focus Timer</h1>

                {!isActive ? (
                    <div className="relative z-10 w-full max-w-sm mb-10">
                        <input
                            type="text"
                            value={focusGoal}
                            onChange={(e) => setFocusGoal(e.target.value)}
                            placeholder="What are you working on?"
                            className="w-full bg-transparent border-b border-zinc-700 text-center text-lg text-white placeholder-zinc-600 focus:outline-none focus:border-white py-2 transition-colors font-medium"
                        />
                    </div>
                ) : (
                    <div className="relative z-10 mb-10 animate-in fade-in slide-in-from-top-2">
                        <p className="text-zinc-500 text-sm uppercase tracking-widest mb-1">Current Focus</p>
                        <p className="text-xl font-medium text-white">{focusGoal || "Deep Work Session"}</p>
                    </div>
                )}

                {/* Timer Display */}
                <div className="relative w-64 h-64 mb-12 flex items-center justify-center z-10">
                    {/* SVG Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="#262626"
                            strokeWidth="8"
                            fill="transparent"
                        />
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke={mode === 'focus' ? "white" : "#10b981"} // White for focus, Green for break
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 120}
                            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                            className="transition-all duration-1000 ease-linear"
                            strokeLinecap="round"
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-6xl font-mono font-bold tracking-tighter ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-xs uppercase tracking-widest text-zinc-500 mt-2 font-semibold">
                            {isActive ? 'RUNNING' : 'PAUSED'}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 mb-12 z-10">
                    <button
                        onClick={toggleTimer}
                        className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:bg-zinc-200 transition-all hover:scale-105"
                    >
                        {isActive ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                    </button>

                    <button
                        onClick={resetTimer}
                        className="w-12 h-12 bg-[#1a1a1a] border border-[#333] text-zinc-400 rounded-full flex items-center justify-center hover:bg-[#262626] hover:text-white transition-all"
                    >
                        <RotateCcw className="h-5 w-5" />
                    </button>
                </div>

                {/* Mode Switchers */}
                <div className="flex gap-4 z-10">
                    <button
                        onClick={() => switchMode('focus')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'focus' ? 'bg-[#1a1a1a] text-white border border-[#333]' : 'text-zinc-600 hover:text-zinc-400'
                            }`}
                    >
                        <TimerIcon className="h-4 w-4" /> Focus
                    </button>
                    <button
                        onClick={() => switchMode('break')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'break' ? 'bg-[#1a1a1a] text-white border border-[#333]' : 'text-zinc-600 hover:text-zinc-400'
                            }`}
                    >
                        <Coffee className="h-4 w-4" /> Break
                    </button>
                </div>

                {/* Music Player */}
                <div className="mt-8 border-t border-[#262626] pt-8 w-full z-10">
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest text-center">Concentration Music</h3>
                    <div className="flex justify-center gap-3 flex-wrap">
                        {stations.filter(s => s.modes.includes(mode)).map((station) => (
                            <button
                                key={station.id}
                                onClick={() => setMusicMode(station.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all ${musicMode === station.id
                                    ? 'bg-white text-black'
                                    : 'bg-[#1a1a1a] text-zinc-500 hover:text-white hover:bg-[#262626]'
                                    }`}
                            >
                                <station.icon className="h-3 w-3" />
                                <span>{station.label}</span>
                                {musicMode === station.id && station.id !== 'none' && (
                                    <span className="flex gap-0.5 h-2 items-end">
                                        <span className="w-0.5 bg-black animate-[pulse_0.8s_ease-in-out_infinite] h-full"></span>
                                        <span className="w-0.5 bg-black animate-[pulse_1.2s_ease-in-out_infinite] h-2/3"></span>
                                        <span className="w-0.5 bg-black animate-[pulse_1.0s_ease-in-out_infinite] h-1/2"></span>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Volume Slider (Only if music is playing) */}
                {currentStation && currentStation.id !== 'none' && (
                    <div className="mt-6 flex flex-col items-center gap-2 w-full max-w-xs animate-in fade-in slide-in-from-bottom-2 relative z-20">
                        <div className="flex items-center gap-3 w-full">
                            <button onClick={toggleMute} className="text-zinc-500 hover:text-white transition-colors">
                                {volume === 0 ? <Mute className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={(e) => {
                                    const newVol = Number(e.target.value);
                                    setVolume(newVol);
                                    const player = playerRef.current;
                                    if (player && typeof player.setVolume === 'function') {
                                        player.setVolume(newVol);
                                    }
                                }}
                                className="w-full h-2 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300 transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
                            />
                        </div>
                    </div>
                )}

                {/* Invisible YouTube Player */}
                {currentStation && currentStation.id !== 'none' && (
                    <div className="absolute opacity-0 pointer-events-none w-px h-px overflow-hidden">
                        <YouTube
                            videoId={currentStation.videoId}
                            opts={playerOpts}
                            onStateChange={(e) => setPlayerStatus(e.data)}
                            onError={(e) => {
                                console.error("YouTube Player Error Code:", e.data);
                                setPlayerStatus(-1); // Reset status on error
                            }}
                            onReady={(e) => {
                                playerRef.current = e.target;
                                e.target.playVideo();
                                e.target.setVolume(volume);
                                if (volume === 0) e.target.mute();
                                else e.target.unMute();
                                setPlayerStatus(1); // Force 'Playing' state visually
                            }}
                        />
                    </div>
                )}

                {/* Log Action */}
                <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-4 duration-500 z-10">
                    <button
                        onClick={handleFinishSession}
                        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors bg-[#0a0a0a]/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-transparent hover:border-zinc-800"
                    >
                        <CheckCircle className="h-3 w-3" /> Log Session
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FocusMode;
