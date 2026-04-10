from youtube_transcript_api import YouTubeTranscriptApi
import sys

try:
    transcript = YouTubeTranscriptApi.get_transcript(sys.argv[1])
    print(transcript[:2])
except Exception as e:
    import traceback
    traceback.print_exc()
