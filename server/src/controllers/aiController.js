import { generateAIContent, generateEmbedding, cosineSimilarity } from '../services/aiService.js';
import StudyLog from '../models/StudyLog.js';
import AIHistory from '../models/AIHistory.js';
import ChatSession from '../models/ChatSession.js';
import axios from 'axios';

const createSession = async (req, res) => {
    try {
        const session = await ChatSession.create({
            user: req.user._id,
            title: 'New Chat',
            messages: [{
                role: 'assistant',
                content: `Hello ${req.user.name || 'Agent Stark'}. I have access to your study logs. How can I assist you today?`,
                createdAt: new Date()
            }]
        });
        res.json(session);
    } catch (error) {
        console.error("createSession Error:", error);
        res.status(500).json({ message: "Failed to create session" });
    }
};

const getAllSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ user: req.user._id })
            .select('title lastActive createdAt')
            .sort({ lastActive: -1 });
        res.json(sessions);
    } catch (error) {
        console.error("getAllSessions Error:", error);
        res.status(500).json({ message: "Failed to fetch sessions" });
    }
};

const getSessionById = async (req, res) => {
    try {
        const session = await ChatSession.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.json(session);
    } catch (error) {
        console.error("getSessionById Error:", error);
        res.status(500).json({ message: "Failed to fetch session" });
    }
};

const generateContent = async (req, res) => {
    const { type, prompt, context, sessionId } = req.body;

    try {
        // setup context for chat
        let aiContext = context || "";

        if (type === 'chat') {
            // --- PERSISTENT MEMORY / VECTOR SEARCH ---
            // 1. Generate an embedding for the user's prompt
            const promptEmbedding = await generateEmbedding(prompt);
            
            let logs = [];
            if (promptEmbedding) {
                // Fetch ALL study logs for user that have an embedding mathematically computed
                const allLogs = await StudyLog.find({ 
                    user: req.user._id,
                    embedding: { $exists: true, $not: { $size: 0 } }
                }).select('subject topic date aiSummary confidenceLevel embedding');
                
                // Score them using mathematical Cosine Similarity in Javascript
                const scoredLogs = allLogs.map(log => ({
                    ...log.toObject(),
                    score: cosineSimilarity(promptEmbedding, log.embedding)
                }));
                
                // Sort descending (best match first) and take top 5
                scoredLogs.sort((a, b) => b.score - a.score);
                logs = scoredLogs.slice(0, 5);
                console.log(`[Memory] Vector Search returned top ${logs.length} closest matches.`);
            } else {
                // Fallback to top 5 most recent if Gemini Embedding failed
                logs = await StudyLog.find({ user: req.user._id })
                    .sort({ date: -1 })
                    .limit(5)
                    .select('subject topic date aiSummary confidenceLevel');
            }

            const history = logs.map(log =>
                `- [${new Date(log.date).toLocaleDateString()}] ${log.subject}: ${log.topic} (Confidence: ${log.confidenceLevel}/5). Notes: ${log.aiSummary}`
            ).join('\n');

            const historyText = history.length > 0 ? history : "No study history found yet.";

            if (aiContext) {
                aiContext = `[UPLOADED DOCUMENT CONTENT]:\n${aiContext}\n\n[RELEVANT RECALLED MEMORIES]:\n${historyText}`;
            } else {
                aiContext = `[RELEVANT RECALLED MEMORIES]:\n${historyText}`;
            }
        }

        // save the user message to db
        if (type === 'chat' && sessionId) {
            await ChatSession.findOneAndUpdate(
                { _id: sessionId, user: req.user._id },
                {
                    $push: { messages: { role: 'user', content: prompt } },
                    $set: { lastActive: Date.now() }
                }
            );

            // make a smart title if it's a new chat
            const session = await ChatSession.findById(sessionId);
            if (session && session.title === 'New Chat') {
                try {
                    // Ask AI for a concise title based on the first prompt
                    const titlePrompt = `Generate a very short, concise topic title (max 5 words) for this chat based on this user message: "${prompt}". Do not use quotes.`;
                    const generatedTitle = await generateAIContent('chat', '', titlePrompt);

                    // clean up the title
                    const cleanTitle = generatedTitle.replace(/^"|"$/g, '').trim().substring(0, 30);
                    session.title = cleanTitle || 'New Chat';
                    await session.save();
                } catch (titleError) {
                    console.error("Failed to generate smart title:", titleError);
                    // fallback if it fails
                    // console.error("title gen failed", titleError);
                    session.title = prompt.split(' ').slice(0, 5).join(' ') + '...';
                    await session.save();
                }
            }
        }

        const result = await generateAIContent(type, aiContext, prompt);
        const finalResult = typeof result === 'string' ? result : JSON.stringify(result);

        // store the ai's response
        if (type === 'chat' && sessionId) {
            await ChatSession.findOneAndUpdate(
                { _id: sessionId, user: req.user._id },
                {
                    $push: { messages: { role: 'assistant', content: finalResult } },
                    $set: { lastActive: Date.now() }
                }
            );
        } else if (type !== 'chat') {
            await AIHistory.create({
                user: req.user._id,
                type,
                inputContext: context ? context.substring(0, 500) + "..." : "",
                result: finalResult
            });
        }

        res.json({ result: finalResult });
    } catch (error) {
        console.error("AI Controller Error:", error);
        if (error.message.includes("Missing API Key")) {
            return res.json({ result: "Simulation: Please configure GROQ_API_KEY." });
        }
        res.status(500).json({ message: "AI generation failed: " + error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const history = await AIHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch history" });
    }
};

// getting the session msgs (legacy)
const getChatHistory = async (req, res) => {
    try {
        const session = await ChatSession.findOne({ user: req.user._id });
        res.json(session ? session.messages : []);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch chat history" });
    }
};

const deleteSession = async (req, res) => {
    try {
        const session = await ChatSession.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.json({ message: "Session deleted successfully" });
    } catch (error) {
        console.error("deleteSession Error:", error);
        res.status(500).json({ message: "Failed to delete session" });
    }
};

// Extract YouTube video ID from any URL format
const extractVideoId = (url) => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
        /(?:youtu\.be\/)([^&\n?#]+)/,
        /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

// Helper: In production, route page scraping through ScraperAPI to bypass cloud IP bans.
// In local dev, hits YouTube directly (no SCRAPER_API_KEY needed).
const proxyGet = async (url, options = {}) => {
    const scraperKey = process.env.SCRAPER_API_KEY;
    if (scraperKey) {
        // Route through ScraperAPI residential proxy
        const proxied = `http://api.scraperapi.com?api_key=${scraperKey}&url=${encodeURIComponent(url)}&render=false`;
        return axios.get(proxied, { ...options, timeout: 30000 });
    }
    // Local dev — hit directly
    return axios.get(url, options);
};

// Robust transcript fetcher — scrapes YouTube page HTML directly (no API key, supports all languages)
const fetchYouTubeTranscriptFromPage = async (videoId) => {
    let sessionCookies = 'CONSENT=YES+cb.20210328-17-p0.en-GB+FX+403;';
    
    // STEP 0: Live Session Handshake (Get fresh cookies from YouTube)
    try {
        console.log(`[Fusion] Initiating Live Handshake...`);
        const handshakeRes = await axios.get('https://www.youtube.com/', { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' },
            timeout: 5000 
        });
        const setCookies = handshakeRes.headers['set-cookie'];
        if (setCookies) {
            sessionCookies += ' ' + setCookies.map(c => c.split(';')[0]).join('; ');
        }
    } catch (e) {
        console.warn('Handshake failed, using default cookies');
    }

    const commonHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': '*/*',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com',
        'X-Goog-Visitor-Id': 'CgtVWEtoT0QtV1FTNCik766hBg%3D%3D',
        'Cookie': sessionCookies
    };

    let captionTracks = [];
    let transcriptText = '';
    let languageCode = 'en';

    // 1. PRIME: InnerTube Android API (Bypasses PoToken and &exp=xpe block)
    if (captionTracks.length === 0) {
        try {
            console.log(`[Fusion] Phase 1: Android Signing...`);
            const payload = { videoId, context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } } };
            // InnerTube is an official Google API — direct POST works even from cloud IPs usually
            const pRes = await axios.post('https://www.youtube.com/youtubei/v1/player', payload, { 
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000
            });
            captionTracks = pRes.data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
            console.log(`[Fusion] Phase 1 found ${captionTracks.length} tracks.`);
        } catch (e) {
            console.warn(`[Fusion] Android approach failed: ${e.message}`);
        }
    }

    // 3. NUCLEAR OPTION: Embed Page Extraction (routed via proxy in production)
    let eHtml = '';
    if (captionTracks.length === 0) {
        try {
            console.log(`[Fusion] Phase 3: NUCLEAR EMBED EXTRACTION...`);
            const eRes = await proxyGet(`https://www.youtube.com/embed/${videoId}`, { headers: commonHeaders });
            eHtml = eRes.data;
            const eMatch = eHtml.match(/"captionTracks":(\[.*?\])/s) || eHtml.match(/ytInitialPlayerResponse\s*=\s*({.*?});/s);
            if (eMatch) {
                const parsed = JSON.parse(eMatch[1]);
                captionTracks = parsed.captionTracks || parsed.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
                console.log(`[Fusion] Phase 3 found ${captionTracks.length} tracks.`);
            }
        } catch (e) { console.warn(`[Fusion] Phase 3 failed: ${e.message}`); }
    }

    // 4. ADVANCED FALLBACK: Aggressive Extraction from Initial Data
    if (captionTracks.length === 0) {
        try {
            console.log(`[Fusion] Phase 4: Aggressive Data Extraction...`);
            // Search for captions in different possible locations via regex on the player response
            const dataPats = [
                /"captionTracks":\s*(\[.*?\])/,
                /"captions":\s*({.*?playerCaptionsTracklistRenderer.*?})/,
                /ytInitialPlayerResponse\s*=\s*({.+?});/
            ];

            for (const pat of dataPats) {
                const match = eHtml.match(pat);
                if (match) {
                    try {
                        const content = match[1];
                        const parsed = JSON.parse(content.endsWith(';') ? content.slice(0, -1) : content);
                        const tracks = parsed.captionTracks || parsed.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
                        if (tracks.length > 0) {
                            captionTracks = tracks;
                            console.log(`[Fusion] Phase 4 SUCCESS: Found ${tracks.length} tracks via aggressive regex.`);
                            break;
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {
            console.warn(`[Fusion] Phase 4 failed: ${e.message}`);
        }
    }

    if (!captionTracks || captionTracks.length === 0) {
        // Validation check for deleted/private videos or restricted profiles
        try {
            const checkRes = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, { headers: commonHeaders });
            const html = checkRes.data;
            const isUnavailable = html.includes('This video is unavailable') || 
                                html.includes('This video is private') ||
                                html.includes('"reason":"Video unavailable"') ||
                                html.includes('"status":"ERROR"') ||
                                html.includes('LOGIN_REQUIRED');

            if (isUnavailable) {
                throw new Error('This video is either private, deleted, or age-restricted.');
            }
        } catch (e) {
            if (e.response?.status === 404 || e.response?.status === 400) {
                throw new Error('The YouTube video ID is invalid or the video has been deleted.');
            }
            if (e.message.includes('restricted')) throw e;
        }
        throw new Error('YouTube has blocked automated transcript access for this video. Use a video with official subtitles enabled.');
    }

    // 5. SECURE FETCH: Pick track and use its SIGNED baseUrl directly
    const track = captionTracks.find(t => t.languageCode?.startsWith('en') && t.kind !== 'asr') ||
                  captionTracks.find(t => t.languageCode?.startsWith('en')) ||
                  captionTracks.find(t => t.languageCode?.startsWith('hi')) ||
                  captionTracks[0];

    languageCode = track.languageCode;
    console.log(`[Fusion] Unlocking track: ${languageCode}`);

    // Try multiple formats using the signed baseUrl
    const formats = ['&fmt=json3', '&fmt=3', ''];
    for (const f of formats) {
        try {
            const signedUrl = track.baseUrl + (track.baseUrl.includes('?') ? '' : '?') + f;
            const res = await axios.get(signedUrl, { headers: { ...commonHeaders }, timeout: 20000 });
            let data = res.data;

            if (typeof data === 'string' && data.startsWith('{')) data = JSON.parse(data);

            if (data && data.events) {
                transcriptText = data.events
                    .filter(e => e.segs)
                    .flatMap(e => e.segs)
                    .map(s => s.utf8 || '')
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            } else if (typeof data === 'string' && data.length > 100) {
                transcriptText = data.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
            }

            if (transcriptText.length > 100) break;
        } catch (e) {
            console.warn(`Format ${f} failed for video ${videoId}`);
        }
    }

    if (!transcriptText || transcriptText.length < 50) {
        throw new Error('Final transcript retrieval blocked. This video might have subtitles disabled by the uploader.');
    }

    return { text: transcriptText, lang: languageCode };
};

// YouTube Transcript → AI Study Material
const getYoutubeTranscript = async (req, res) => {
    const { youtubeUrl, mode } = req.body;
    if (!youtubeUrl) return res.status(400).json({ message: 'YouTube URL is required' });

    const videoId = extractVideoId(youtubeUrl.trim());
    if (!videoId) return res.status(400).json({ message: 'Invalid YouTube URL. Could not extract video ID.' });

    try {
        const { text: transcriptText, lang } = await fetchYouTubeTranscriptFromPage(videoId);

        if (!transcriptText || transcriptText.length < 30) {
            return res.status(422).json({ message: 'Transcript was empty or too short. Try a different video.' });
        }

        // --- THE EXTRAORDINARY UPGRADE: Long-form Intelligence ---
        // Groq free tier limit is strictly 6000 Tokens Per Minute (TPM).
        // A token is roughly 4 characters. So 6000 tokens ≈ 24000 characters.
        // We set MAX_CHARS to 16000 to safely leave room for the prompt and output tokens.
        let processedTranscript = transcriptText;
        const MAX_CHARS = 16000; 

        if (transcriptText.length > MAX_CHARS) {
            console.log(`Video too long (${transcriptText.length} chars). Using smart sampling...`);
            const chunk = Math.floor(MAX_CHARS / 3);
            const start = transcriptText.substring(0, chunk);
            const mid = transcriptText.substring(Math.floor(transcriptText.length / 2) - Math.floor(chunk / 2), Math.floor(transcriptText.length / 2) + Math.floor(chunk / 2));
            const end = transcriptText.substring(transcriptText.length - chunk);
            processedTranscript = `${start}\n\n[...section omitted...]\n\n${mid}\n\n[...section omitted...]\n\n${end}`;
        }

        console.log(`Processing ${processedTranscript.length} characters of transcript...`);

        const aiMode = mode || 'summary';
        const result = await generateAIContent(aiMode, processedTranscript, '');
        const finalResult = typeof result === 'string' ? result : JSON.stringify(result);

        await AIHistory.create({
            user: req.user._id,
            type: aiMode,
            inputContext: `[YouTube: ${youtubeUrl}] (Length: ${transcriptText.length} chars)`,
            result: finalResult
        });

        res.json({
            result: finalResult,
            videoId,
            lang,
            transcriptLength: transcriptText.length
        });
    } catch (error) {
        console.error('YouTube transcript error:', error.message);
        const msg = error.message || 'Unknown error';
        
        // --- EXTRAORDINARY FIX: Don't mask real errors ---
        if (msg.includes('completely locked') || msg.includes('retrieval blocked')) {
            return res.status(403).json({ message: msg });
        }
        
        if (msg.includes('No captions') || msg.includes('disabled')) {
            return res.status(422).json({ message: 'This video has no subtitles. Try a video with CC/captions enabled (look for the CC icon on the video).' });
        }
        if (msg.includes('timeout') || msg.includes('ECONNREFUSED')) {
            return res.status(503).json({ message: 'Could not reach YouTube. Check your internet and try again.' });
        }
        res.status(500).json({ message: 'Failed to get transcript: ' + msg });
    }
};

export { generateContent, getHistory, getChatHistory, createSession, getAllSessions, getSessionById, deleteSession, getYoutubeTranscript };
