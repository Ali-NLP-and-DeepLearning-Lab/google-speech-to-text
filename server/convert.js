// /Users/jtimmons/Downloads/ffmpeg-3.4.2/ffmpeg -i ORTH025_10.26.17.MP3 -c:a flac -ar 16000 -sample_fmt s16 -ac 1 output.flac

const shortid = require("shortid");
const child_process = require("child_process");
const fs = require("fs");

const config = require("../src/config.js");

/**
 * Converts the client side file to a flac type file, supported by google speech, with ffmpeg
 *
 * @param {String} jobID  the random string id for the job
 * @param {String} input  Base64 string reprentation of the file to be converted
 *                          to flac format
 *
 * @returns {String}   path to an audio file with that's:
 *                          1. flac format
 *                          2. 16000 Hz
 *                          3. mono
 */
module.exports = async (jobID, input) => {
  // write the file to the local directory
  await new Promise((resolve, reject) => {
    fs.writeFile(
      `${jobID}`,
      input.replace(/^data:audio\/\w+;base64,/, ""),
      {
        encoding: "base64"
      },
      err => {
        if (err) reject(err);
        resolve();
      }
    );
  });

  // convert the file to flac format
  const flacLoc = await new Promise((resolve, reject) => {
    const newFile = `${jobID}.FLAC`;
    child_process.exec(
      `${
        config.FFMPEG
      } -i ${jobID} -c:a flac -ar 16000 -sample_fmt s16 -ac 1 ${newFile}`,
      err => {
        if (err) reject(err);
        resolve(newFile);
      }
    );
  });

  return flacLoc;
};
