import axios from 'axios';

const videoId = 'kCc8FmEb1nY'; // A known working video

const test = async () => {
    console.log(`[Test] Starting test for video: ${videoId}`);
    let sessionCookies = 'CONSENT=YES+cb.20210328-17-p0.en-GB+FX+403;';
    
    try {
        console.log(`[Test] Step 1: Live Handshake...`);
        const handshakeRes = await axios.get('https://www.youtube.com/', { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' },
            timeout: 10000 
        });
        console.log(`[Test] Handshake success! Status: ${handshakeRes.status}`);
        const setCookies = handshakeRes.headers['set-cookie'];
        if (setCookies) {
            sessionCookies += ' ' + setCookies.map(c => c.split(';')[0]).join('; ');
            console.log(`[Test] Received ${setCookies.length} cookies.`);
        }
    } catch (e) {
        console.error(`[Test] Handshake failed: ${e.message}`);
    }

    const commonHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': '*/*',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com',
        'Cookie': sessionCookies
    };

    console.log(`[Test] Step 2: Trying TV Identity...`);
    try {
        const tvPayload = {
            videoId: videoId,
            context: { client: { clientName: 'TVHTML5', clientVersion: '7.20230405.08.01' } }
        };
        const tvRes = await axios.post('https://www.youtube.com/youtubei/v1/player', tvPayload, {
            headers: { ...commonHeaders, 'Content-Type': 'application/json' }
        });
        const tracks = tvRes.data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
        console.log(`[Test] TV Identity found ${tracks.length} tracks.`);
        if (tracks.length > 0) {
            console.log(`[Test] First track:`, tracks[0]);
        }
    } catch (e) {
        console.error(`[Test] TV Identity failed: ${e.message}`);
        if (e.response) {
            console.error(`[Test] Response Status: ${e.response.status}`);
            console.error(`[Test] Response Data:`, JSON.stringify(e.response.data).substring(0, 500));
        }
    }

    console.log(`[Test] Step 3: Trying Web Extraction...`);
    try {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const res = await axios.get(url, { headers: commonHeaders, timeout: 15000 });
        const html = res.data;
        console.log(`[Test] Web page fetched. Length: ${html.length}`);
        const p1 = /"captionTracks":(\[.*?\])/s;
        const match = html.match(p1);
        if (match) {
            console.log(`[Test] Found captionTracks string in HTML.`);
            const parsed = JSON.parse(match[1]);
            console.log(`[Test] Parsed ${parsed.length} tracks from Web.`);
            console.log(`[Test] Web tracks:`, JSON.stringify(parsed, null, 2));
        } else {
            console.log(`[Test] captionTracks string NOT found in HTML.`);
        }
    } catch (e) {
        console.error(`[Test] Web Extraction failed: ${e.message}`);
    }
};

test().catch(err => {
    console.error(`[Test] Fatal error: ${err.message}`);
});
