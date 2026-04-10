import axios from 'axios';
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

    // 1. EXTRAORDINARY STEP: Smart TV Protocol (TVHTML5)
    if (captionTracks.length === 0) {
        try {
            console.log(`[Fusion] Using Smart TV Identity for ${videoId}`);
            const tvPayload = {
                videoId: videoId,
                context: { client: { clientName: 'TVHTML5', clientVersion: '7.20230405.08.01' } }
            };
            const tvRes = await axios.post('https://www.youtube.com/youtubei/v1/player', tvPayload, {
                headers: { ...commonHeaders, 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (SmartHub; SMART-TV; Sony; 2023) AppleWebkit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' }
            });
            captionTracks = tvRes.data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
        } catch (e) {
            console.warn(`TV Protocol failed: ${e.message}`);
        }
    }

    // 2. BACKUP: Multi-Attempt Metadata Extraction (Web)
    if (captionTracks.length === 0) {
        try {
            console.log(`[Fusion] Trying Web Signature extraction...`);
            const url = `https://www.youtube.com/watch?v=${videoId}`;
            const res = await axios.get(url, { headers: commonHeaders, timeout: 15000 });
            const html = res.data;
            const patterns = [ /"captionTracks":(\[.*?\])/s, /ytInitialPlayerResponse\s*=\s*({.*?});/s ];
            for (const p of patterns) {
                const match = html.match(p);
                if (match) {
                    try {
                        const parsed = JSON.parse(match[1]);
                        captionTracks = parsed.captionTracks || parsed.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
                        if (captionTracks.length > 0) break;
                    } catch (e) {}
                }
            }
        } catch (e) {}
    }

    // 2. BACKUP: InnerTube Android API
    if (captionTracks.length === 0) {
        try {
            console.log(`[Fusion] Phase 2: Android Signing...`);
            const payload = { videoId, context: { client: { clientName: 'ANDROID', clientVersion: '19.05.35' } } };
            const pRes = await axios.post('https://www.youtube.com/youtubei/v1/player', payload, { headers: { 'Content-Type': 'application/json' } });
            captionTracks = pRes.data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
        } catch (e) {}
    }

    // 3. NUCLEAR OPTION: Embed Page Extraction
    if (captionTracks.length === 0) {
        try {
            console.log(`[Fusion] Phase 3: NUCLEAR EMBED EXTRACTION...`);
            const eRes = await axios.get(`https://www.youtube.com/embed/${videoId}`, { headers: commonHeaders });
            const eHtml = eRes.data;
            const eMatch = eHtml.match(/"captionTracks":(\[.*?\])/s) || eHtml.match(/ytInitialPlayerResponse\s*=\s*({.*?});/s);
            if (eMatch) {
                const parsed = JSON.parse(eMatch[1]);
                captionTracks = parsed.captionTracks || parsed.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
            }
        } catch (e) {}
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
    const formats = ['&fmt=json3&c=TVHTML5&cver=7.20230405.08.01', '&fmt=3&c=TVHTML5&cver=7.20230405.08.01', '&fmt=json3', '&fmt=3', ''];
    for (const f of formats) {
        try {
            const signedUrl = track.baseUrl + (track.baseUrl.includes('?') ? '' : '?') + f;
            const res = await axios.get(signedUrl, { headers: { ...commonHeaders }, timeout: 20000 });
            let data = res.data; console.log(`Format ${f} fetched. Status: ${res.status}`); if(typeof data === 'string' && data.length < 200) console.log('Data snippet:', data); else console.log('Data len:', typeof data === 'string'? data.length : JSON.stringify(data).length);

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
fetchYouTubeTranscriptFromPage('1au8pYTrF3M').then(r => console.log('Final text len:', r.text.length)).catch((e) => console.error('ERROR OUT:', e.message));
