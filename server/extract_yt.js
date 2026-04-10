import axios from 'axios';
async function test() {
    try {
        const htmlRes = await axios.get('https://www.youtube.com/watch?v=1au8pYTrF3M');
        const apiKeyMatch = htmlRes.data.match(/"INNERTUBE_API_KEY":"(.*?)"/);
        if(!apiKeyMatch) return console.log('no key');
        const res = await axios.post('https://www.youtube.com/youtubei/v1/player?key=' + apiKeyMatch[1], {
            context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
            videoId: '1au8pYTrF3M'
        }, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' } });
        const tracks = res.data.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if(tracks && tracks.length > 0) {
            console.log('has tracks! url:', tracks[0].baseUrl.substring(0, 100));
            const tl = await axios.get(tracks[0].baseUrl);
            console.log('Final Transcript length:', tl.data.length);
        } else console.log('no tracks from player api', res.data.playabilityStatus);
    } catch(e) { console.error('error', e.message); }
}
test();
