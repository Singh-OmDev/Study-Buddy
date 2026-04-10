import axios from 'axios';

const videoId = 'kCc8FmEb1nY';

const test = async () => {
    let sessionCookies = 'CONSENT=YES+cb.20210328-17-p0.en-GB+FX+403;';
    
    try {
        console.log(`[Test] Initiating Live Handshake...`);
        const handshakeRes = await axios.get('https://www.youtube.com/', { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' },
            timeout: 10000 
        });
        const setCookies = handshakeRes.headers['set-cookie'];
        if (setCookies) {
            sessionCookies += ' ' + setCookies.map(c => c.split(';')[0]).join('; ');
        }
    } catch (e) {
        console.warn('Handshake failed');
    }

    const commonHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': '*/*',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com',
        'Cookie': sessionCookies
    };

    console.log(`[Test] Trying TV Identity for ${videoId}`);
    try {
        const tvPayload = {
            videoId: videoId,
            context: { client: { clientName: 'TVHTML5', clientVersion: '7.20230405.08.01' } }
        };
        const tvRes = await axios.post('https://www.youtube.com/youtubei/v1/player', tvPayload, {
            headers: { ...commonHeaders, 'Content-Type': 'application/json' }
        });
        console.log('TV Captions:', JSON.stringify(tvRes.data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [], null, 2));
    } catch (e) {
        console.error('TV failed:', e.message);
    }

    console.log(`[Test] Trying Android Identity for ${videoId}`);
    try {
        const androidPayload = {
            videoId: videoId,
            context: { client: { clientName: 'ANDROID', clientVersion: '19.05.35' } }
        };
        const androidRes = await axios.post('https://www.youtube.com/youtubei/v1/player', androidPayload, {
            headers: { ...commonHeaders, 'Content-Type': 'application/json' }
        });
        console.log('Android Captions:', JSON.stringify(androidRes.data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [], null, 2));
    } catch (e) {
        console.error('Android failed:', e.message);
    }
};

test();
