process.env.GOOGLE_APPLICATION_CREDENTIALS = "./server/key.json";

// /Users/jtimmons/Downloads/ffmpeg-3.4.2/ffmpeg -i ORTH025_10.26.17.MP3 -c:a flac -ar 16000 -sample_fmt s16 -ac 1 output.flac

// Imports the Google Cloud client library
const speech = require("@google-cloud/speech");
const fs = require("fs");

// Creates a client
const client = new speech.SpeechClient();

module.exports = (jobID, gcsUri) => {
  const config = {
    encoding: "FLAC",
    sampleRateHertz: 16000,
    languageCode: "en-US"
  };

  const audio = {
    uri: gcsUri
  };

  const request = {
    config: config,
    audio: audio
  };

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  return client
    .longRunningRecognize(request)
    .then(data => {
      const operation = data[0];
      // Get a Promise representation of the final result of the job
      return operation.promise();
    })
    .then(data => {
      const response = data[0];
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join("");
      fs.writeFileSync(`${jobID}.txt`, transcription, { encoding: "utf8" }); //save to local file system
    })
    .catch(err => {
      console.error("ERROR:", err);
    });
};
