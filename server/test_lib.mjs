import { YoutubeTranscript } from 'youtube-transcript';
YoutubeTranscript.fetchTranscript('1au8pYTrF3M').then(res => console.log('success!!! len:', res.length)).catch(console.error);
