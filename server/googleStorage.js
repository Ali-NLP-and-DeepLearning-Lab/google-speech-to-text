const Storage = require("@google-cloud/storage");
const shortid = require("shortid");

const config = require("../src/config.js");

const storage = Storage({
  projectId: config.GCLOUD_PROJECT
});
const bucket = storage.bucket(config.CLOUD_BUCKET);

function getURL(filename) {
  const uri = filename.replace(/\.\//, "");
  return `gs://${config.CLOUD_BUCKET}/${uri}`;
}

module.exports.upload = filename => {
  return new Promise((resolve, reject) => {
    // some random id for file
    bucket
      .upload(filename)
      .then(() => resolve(getURL(filename)))
      .catch(err => reject(err));
  });
};

module.exports.delete = filename => {
  return new Promise((resolve, reject) => {
    // some random id for file
    bucket
      .file(filename)
      .delete()
      .then(() => resolve(getURL(filename)))
      .catch(err => reject(err));
  });
};
