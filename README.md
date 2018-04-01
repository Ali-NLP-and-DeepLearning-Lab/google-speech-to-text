# google-speech-to-text

App for transcribing audio files (of any type) using Google's speech API

Client built with Create-React-App. Uploads any audio file, then polls server until transcription is complete.

Server is an Express api that:
  1. Converts audio file to FLAC format (16000 Hz, 16 bit, single channel, per [api specs](https://cloud.google.com/speech/docs/best-practices))
  2. Uploads the file to Google Storage (speech api only works with large files if in GS)
  3. Applies Google's speech API and returns the transcript

![text alignment](https://github.com/JJTimmons/google-speech-to-text/blob/master/analysis/alignment.png?raw=true)
