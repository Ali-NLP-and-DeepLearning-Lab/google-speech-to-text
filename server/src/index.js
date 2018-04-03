require("babel-polyfill");

process.env.NODE_ENV = "production";

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const compression = require("compression");
const helmet = require("helmet");

const googleStorage = require("./googleStorage.js");
const transcribe = require("./transcribe.js");
const convert = require("./convert.js");
const config = require("../src/config.js");

const app = express();
const upload = multer({
  limits: { fieldSize: 50 * 1024 * 1024 } // max = 50MB
});

const cleanUp = jobID => {
  const flacPath = `${jobID}.FLAC`; // what would be name of converted file
  const transcriptPath = `${jobID}.txt`; // transcript path
  const gsPath = `${jobID}.FLAC`; // google storage path
  fs.unlinkSync(jobID); // original file
  fs.unlinkSync(transcriptPath); // clean up files
  fs.unlinkSync(flacPath);
  googleStorage.delete(gsPath);
};

app.use(cors({ origin: config.CLIENT_URL }));
app.use(compression());
app.use(helmet());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

/**
 * take in a file, convert it to FLAC format, send it to google storage,
 * use the google speech api to translate it, return the transcribed file
 */
app.use("/transcribe", upload.array(), async (req, res) => {
  const jobID = req.body.jobID;
  const file = req.body.file;

  try {
    const convertedFilePath = await convert(jobID, file); // convert to FLAC

    res.status(200).send("Transcribing...");

    const url = await googleStorage.upload(convertedFilePath); // send to google storage

    transcribe(jobID, url); // transcribe w/ google's api
  } catch (err) {
    res.status(409).send("failed");
    cleanUp(jobID);
  }
});

/**
 * check whether 1) the file is still being converted (the FLAC file exists)
 * 2) the file is not being converted (bad request or failed)
 * 3) the file has successfully been translated, return the transcript and delete
 * the converted file
 */
app.use("/results", async (req, res) => {
  const jobID = req.body.jobID;

  const flacPath = `${jobID}.FLAC`; // what would be name of converted file
  const transcriptPath = `${jobID}.txt`; // transcript path
  const gsPath = `${jobID}.FLAC`; // google storage path

  const transcriptFileExists = fs.existsSync(transcriptPath); // transcribed
  const flacFileExists = fs.existsSync(flacPath); // still in storage. transcribing
  if (transcriptFileExists) {
    res.status(200).send({
      transcript: fs.readFileSync(transcriptPath, { encoding: "utf8" })
    });
    cleanUp(jobID);
  } else if (flacFileExists) {
    res.status(202).send({ message: "Transcribing..." });
  } else {
    // TODO: be more grandual about whether transcription actually failed, or if there
    // was just nothing here to begin with
    res.status(404).send({ message: "Transcription failed..." });
  }
});

/**
 * server the bundled front end
 */
app.get("*", function(req, res) {
  res.status(404).send();
});

// start the server
app.listen(80, function(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log("Server started; listening on port " + config.SERVER_URL);
});
