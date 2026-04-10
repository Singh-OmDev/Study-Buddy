import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, Users, ArrowLeft, Paintbrush, Eraser, Trash2, Undo2, Video, VideoOff, Mic, MicOff, Phone, PhoneOff, PhoneCall, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import Peer from 'peerjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const StudyRoom = () => {
    const { user, getToken } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Chat state
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    // Canvas state
    const canvasRef = useRef(null);
    const preventCanvasEmit = useRef(false);
    const [strokeColor, setStrokeColor] = useState('#f97316'); 
    const [eraserMode, setEraserMode] = useState(false);

    // Video/WebRTC State
    const [peer, setPeer] = useState(null);
    const [myPeerId, setMyPeerId] = useState('');
    const [remoteBuddyPeerId, setRemoteBuddyPeerId] = useState('');
    
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    
    // We use a ref and a state for localStream to avoid closure capture bugs during hangup!
    const [localStream, setLocalStreamState] = useState(null);
    const localStreamRef = useRef(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const setLocalStream = (stream) => {
        localStreamRef.current = stream;
        setLocalStreamState(stream);
    };

    // Call State Machine: idle -> calling -> ringing -> connected
    const [callState, setCallState] = useState('idle');
    const [incomingCall, setIncomingCall] = useState(null);
    const [activeCall, setActiveCall] = useState(null);

    // Parse query params
    const searchParams = new URLSearchParams(location.search);
    const roomId = searchParams.get('roomId');
    const buddyName = searchParams.get('buddyName');
    const subject = searchParams.get('subject');
    const isAi = searchParams.get('isAi') === 'true';

    useEffect(() => {
        if (!roomId || !user) return;

        const newSocket = io(window.location.origin.replace('5173', '5000'));
        setSocket(newSocket);

        const newPeer = new Peer({
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            },
            pingInterval: 5000 // Keep connection to PeerJS cloud alive
        });
        setPeer(newPeer);
        
        newPeer.on('disconnected', () => {
            console.log('PeerJS disconnected from signaling server. Reconnecting...');
            if (!newPeer.destroyed) {
                newPeer.reconnect();
            }
        });

        newPeer.on('open', (id) => {
            setMyPeerId(id);
            newSocket.emit('share-peer-id', { room: roomId, peerId: id });
        });

        // ONLY listen for calls on mount. hardware activation happens later.
        newPeer.on('call', (call) => {
            setIncomingCall(call);
            setCallState('ringing');
            
            call.on('close', () => {
                setCallState('idle');
                setRemoteStream(null);
                setIncomingCall(null);
                setActiveCall(null);
            });
        });

        newSocket.on('connect', () => {
            newSocket.emit('join-room', roomId);
        });

        newSocket.on('receive-peer-id', (remotePeerId) => {
            setRemoteBuddyPeerId(remotePeerId);
        });

        // Chat & Canvas Data
        newSocket.on('receive-message', (data) => {
            // Ignore socket messages if in AI mode just in case
            if (!isAi) {
                setMessages((prev) => [...prev, data]);
            }
        });
        
        newSocket.on('receive-stroke', (paths) => {
            preventCanvasEmit.current = true;
            if (canvasRef.current) {
                canvasRef.current.loadPaths(paths);
            }
            setTimeout(() => preventCanvasEmit.current = false, 50);
        });

        newSocket.on('canvas-cleared', () => {
            preventCanvasEmit.current = true;
            if (canvasRef.current) {
                canvasRef.current.clearCanvas();
            }
            setTimeout(() => preventCanvasEmit.current = false, 50);
        });

        newSocket.on('buddy-hung-up', () => {
             setCallState('idle');
             setRemoteStream(null);
             if (activeCall) activeCall.close();
             if (incomingCall) incomingCall.close();
        });

        return () => {
             newSocket.disconnect();
             newPeer.destroy();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, user]); 

    // Proper unmount cleanup for camera hardware
    useEffect(() => {
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Handle localVideo assignment properly when the DOM node renders (since it's hidden while idle)
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [callState, localStream]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ---- CALL ACTIONS ----

    const startCall = async () => {
        if (!peer || !remoteBuddyPeerId) return;
        
        try {
            // Activate Hardware ONLY when they decide to call
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);

            const call = peer.call(remoteBuddyPeerId, stream);
            setActiveCall(call);
            setCallState('calling');

            call.on('stream', (userVideoStream) => {
                setRemoteStream(userVideoStream);
                setCallState('connected');
            });

            call.on('close', () => {
                 endCallLocally();
            });
        } catch (err) {
             console.error("Camera access denied or missing", err);
             alert("Could not access camera/microphone. Please check permissions.");
        }
    };

    const answerCall = async () => {
        if (!incomingCall) return;

        try {
            // Activate Hardware ONLY when they decide to accept
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);

            incomingCall.answer(stream);
            setActiveCall(incomingCall);
            setCallState('connected');

            incomingCall.on('stream', (userVideoStream) => {
                setRemoteStream(userVideoStream);
            });

            incomingCall.on('close', () => {
                 endCallLocally();
            });
        } catch (err) {
             console.error("Failed to answer call with media", err);
             incomingCall.close();
             setCallState('idle');
             setIncomingCall(null);
        }
    };

    const rejectCall = () => {
        if (incomingCall) {
            incomingCall.close();
        }
        setCallState('idle');
        setIncomingCall(null);
        socket.emit('call-rejected', { room: roomId }); 
    };

    const endCall = () => {
        if (activeCall) {
            activeCall.close();
        }
        endCallLocally();
        socket?.emit('hang-up', { room: roomId }); 
    };

    const endCallLocally = () => {
        setCallState('idle');
        setRemoteStream(null);
        setActiveCall(null);
        setIncomingCall(null);
        
        // Shut off the hardware camera totally! Uses Ref to bypass closure staleness!
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
            setLocalStreamState(null);
        }
    };

    useEffect(() => {
         if (!socket) return;
         const handleHangup = () => endCallLocally();
         socket.on('receive-hang-up', handleHangup);
         socket.on('call-rejected', handleHangup);
         return () => {
            socket.off('receive-hang-up', handleHangup);
            socket.off('call-rejected', handleHangup);
         };
    }, [socket]);


    // ---- MEDIA ACTIONS ----
    const toggleAudio = () => {
        if (isAi) return;
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioOn(audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (isAi) return;
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !socket) return;
        
        const currentInput = input;
        setInput('');

        const messageData = {
            room: roomId,
            author: user.name || 'User',
            message: currentInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (isAi) {
            setMessages((prev) => [...prev, messageData]);
            
            try {
                const token = await getToken();
                const { data } = await axios.post('/api/match/bot', { 
                     message: currentInput,
                     context: messages.map(m => `${m.author}: ${m.message}`).join('\n')
                }, { headers: { Authorization: `Bearer ${token}` } } );
                
                setMessages(prev => [...prev, {
                    room: roomId,
                    author: buddyName, // Usually 'Agent Stark (AI)'
                    message: data.response,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            } catch (err) {
                 console.error("AI Error:", err);
            }
            return;
        }

        socket.emit('send-message', messageData);
        setMessages((prev) => [...prev, messageData]);
    };



    const handleCanvasChange = (paths) => {
        if (preventCanvasEmit.current) return;
        if (socket && roomId) {
            socket.emit('draw-stroke', { room: roomId, paths });
        }
    };

    const clearCanvas = () => {
        if (canvasRef.current) {
            canvasRef.current.clearCanvas();
            socket.emit('clear-canvas', roomId);
        }
    };

    const undoCanvas = () => {
        if (canvasRef.current) {
            canvasRef.current.undo();
            setTimeout(async () => {
                const paths = await canvasRef.current.exportPaths();
                socket.emit('draw-stroke', { room: roomId, paths });
            }, 50);
        }
    };

    const colors = ['#f97316', '#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#ffffff'];

    if (!roomId) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-400">
                <h2>No Active Study Room.</h2>
                <button onClick={() => navigate('/dashboard')} className="text-white underline mt-4">Go Back</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-500 relative">
            
            {/* --- RINGING MODAL OVERLAY --- */}
            <AnimatePresence>
                {callState === 'ringing' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-10 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 border border-orange-500/50 shadow-2xl p-6 rounded-2xl flex flex-col items-center"
                    >
                        <PhoneCall className="h-10 w-10 text-orange-500 animate-bounce mb-3" />
                        <h2 className="text-white text-lg font-bold">Incoming Call</h2>
                        <p className="text-zinc-400 text-sm mb-6">{buddyName} wants to video chat</p>
                        <div className="flex gap-4">
                            <button onClick={rejectCall} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-full font-medium transition">
                                <PhoneOff className="h-4 w-4" /> Reject
                            </button>
                            <button onClick={answerCall} className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white hover:bg-green-600 rounded-full font-medium transition shadow-lg shadow-green-500/30">
                                <Phone className="h-4 w-4" /> Accept
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition">
                        <ArrowLeft className="h-5 w-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Users className="h-6 w-6 text-orange-500" /> Study Room
                        </h1>
                        <p className="text-zinc-500 text-sm flex gap-2">
                            <span>Subject: <span className="text-zinc-300 font-medium">{subject}</span></span>
                            <span>•</span>
                            <span>Buddy: <span className="text-zinc-300 font-medium">{buddyName}</span></span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    
                    {/* --- DEDICATED CALL BUTTONS (HIDDEN FOR AI) --- */}
                    {!isAi && callState === 'idle' && remoteBuddyPeerId && (
                        <button onClick={startCall} className="flex items-center gap-2 px-4 py-1.5 bg-green-500 text-white text-sm font-bold rounded-full hover:bg-green-600 transition animate-in zoom-in">
                            <Phone className="h-4 w-4" /> Call Buddy
                        </button>
                    )}
                    {!isAi && callState === 'calling' && (
                        <button onClick={endCall} className="flex items-center gap-2 px-4 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full hover:bg-red-600 transition animate-in zoom-in">
                            <PhoneOff className="h-4 w-4" /> Cancel Call
                        </button>
                    )}
                    {!isAi && callState === 'connected' && (
                        <button onClick={endCall} className="flex items-center gap-2 px-4 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full hover:bg-red-600 transition animate-in zoom-in shadow-lg shadow-red-500/20">
                            <PhoneOff className="h-4 w-4" /> End Call
                        </button>
                    )}

                    {/* Media Controls */}
                    <div className="flex bg-[#111] border border-[#262626] rounded-full overflow-hidden">
                        <button onClick={toggleAudio} className={`p-2 transition-colors ${isAudioOn ? 'text-zinc-300 hover:bg-zinc-800' : 'text-red-500 bg-red-500/10'}`}>
                            {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </button>
                        <div className="w-px bg-[#262626]"></div>
                        <button onClick={toggleVideo} className={`p-2 transition-colors ${isVideoOn ? 'text-zinc-300 hover:bg-zinc-800' : 'text-red-500 bg-red-500/10'}`}>
                            {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </button>
                    </div>

                    <div className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live
                    </div>

                </div>
            </div>

            {/* Main Split Area */}
            <div className="flex-1 flex gap-4 mt-4 overflow-hidden relative">
                
                {/* Left Column: Chat (Strict Width) */}
                <div className="w-80 shrink-0 bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#262626] rounded-xl flex flex-col overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-4 pb-48 lg:pb-4 space-y-4 z-10">
                        {messages.map((msg, index) => {
                            const isMe = msg.author === (user?.name || 'User');
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={index} 
                                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                >
                                    <span className="text-xs text-zinc-500 mb-1 ml-1">{msg.author} • {msg.time}</span>
                                    <div className={`px-4 py-2 text-sm rounded-2xl max-w-[85%] overflow-x-auto ${isMe ? 'bg-orange-500 text-white rounded-br-none' : 'bg-[#1a1a1a] text-zinc-200 border border-[#333] rounded-bl-none'}`}>
                                        {!isMe && msg.author?.includes('Agent Stark') ? (
                                            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-snug prose-li:my-0.5">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.message}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.message
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} className="p-3 border-t border-[#262626] bg-[#0a0a0a] z-10 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Message...`}
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
                        />

                        <button type="submit" disabled={!input.trim()} className="bg-white text-black p-2 rounded-full hover:bg-zinc-200 disabled:opacity-50 transition-colors shrink-0">
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>

                {/* Middle Column: Shared Whiteboard */}
                <div className="flex-1 bento-card p-0 overflow-hidden flex flex-col border border-[#262626] relative">
                    
                    {/* Whiteboard Toolbar */}
                    <div className="h-12 bg-[#111111] border-b border-[#262626] flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                           <span className="text-xs text-zinc-400 font-mono uppercase mr-4 tracking-wider">Live Canvas</span>
                           
                           <button 
                               onClick={() => setEraserMode(false)}
                               className={`p-1.5 rounded-md transition ${!eraserMode ? 'bg-orange-500/20 text-orange-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                           >
                               <Paintbrush className="h-4 w-4" />
                           </button>
                           <button 
                               onClick={() => setEraserMode(true)}
                               className={`p-1.5 rounded-md transition ${eraserMode ? 'bg-white/20 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                           >
                               <Eraser className="h-4 w-4" />
                           </button>

                           <div className="w-px h-6 bg-zinc-800 mx-2"></div>

                           {!eraserMode && colors.map(color => (
                               <button 
                                   key={color}
                                   onClick={() => setStrokeColor(color)}
                                   className={`w-6 h-6 rounded-full border-2 transition-all ${strokeColor === color ? 'border-zinc-400 scale-110' : 'border-transparent hover:scale-110'}`}
                                   style={{ backgroundColor: color }}
                               />
                           ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={undoCanvas} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition">
                                <Undo2 className="h-4 w-4" />
                            </button>
                            <button onClick={clearCanvas} className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition ml-2">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 bg-[#1a1a1a] cursor-crosshair relative">
                        <ReactSketchCanvas
                            ref={canvasRef}
                            style={{ border: 'none', background: 'transparent' }}
                            strokeWidth={eraserMode ? 20 : 3}
                            eraseMode={eraserMode}
                            strokeColor={strokeColor}
                            canvasColor="transparent"
                            onChange={handleCanvasChange}
                            withTimestamp={true}
                        />
                    </div>
                </div>

                {/* Right Column: Dedicated Video Feeds or AI Avatar */}
                <div className="w-64 flex flex-col gap-6 p-2 rounded-xl border border-dashed border-[#262626] bg-[#0a0a0a]/50">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider text-center pt-2">Participants</h3>
                    
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto w-full items-center">
                        
                        {isAi ? (
                             <div className="w-full h-48 border border-orange-500/30 bg-[#111] rounded-lg flex flex-col items-center justify-center text-orange-500 p-4 text-center mt-4 shadow-xl shadow-orange-500/10">
                                 <Zap className="h-10 w-10 mb-3 fill-orange-500/20 animate-pulse" />
                                 <span className="font-bold mb-1">Agent Stark System</span>
                                 <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300">AI Fallback Enabled</span>
                             </div>
                        ) : (
                            <>
                                {/* Remote Video (Buddy) */}
                                {callState === 'connected' && remoteStream && (
                                    <div className="w-full aspect-video bg-black rounded-lg border-2 border-orange-500 overflow-hidden shadow-2xl relative group">
                                        <video 
                                            ref={remoteVideoRef} 
                                            autoPlay 
                                            className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute bottom-2 left-2 text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                                            {buddyName}
                                        </div>
                                    </div>
                                )}

                                {/* Local Video (Me) */}
                                {callState !== 'idle' && (
                                    <div className="w-full aspect-video bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden shadow-xl relative flex items-center justify-center">
                                        <video 
                                            ref={localVideoRef} 
                                            autoPlay 
                                            muted 
                                            className={`w-full h-full object-cover ${isVideoOn ? '' : 'hidden'}`} 
                                        />
                                        {!isVideoOn && <div className="absolute inset-0 flex items-center justify-center bg-zinc-900"><VideoOff className="w-6 h-6 text-zinc-600" /></div>}
                                        <div className="absolute bottom-2 left-2 text-[10px] text-zinc-300 bg-black/70 px-2 py-0.5 rounded backdrop-blur font-medium">
                                            You
                                        </div>
                                    </div>
                                )}

                                {/* Idle State Placeholder */}
                                {callState === 'idle' && (
                                    <div className="w-full h-32 border border-dashed border-[#333] rounded-lg flex flex-col items-center justify-center text-zinc-500 p-4 text-center">
                                        <VideoOff className="h-6 w-6 mb-2 opacity-50" />
                                        <span className="text-xs">Camera is offline.<br/>Click "Call Buddy" to connect.</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudyRoom;
