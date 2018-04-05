import React, { Component } from "react";
import Dropzone from "react-dropzone";
import { saveAs } from "file-saver";
import shortid from "shortid";

import config from "./config.js";

export default class App extends Component {
  state = {
    converting: false,
    failed: false,
    jobID: ""
  };

  /**
   * send an audio file to the server for conversion and translation
   */
  sendFiles = files => {
    if (!(files && files.length)) return;
    const file = files[0];

    var xhr = new XMLHttpRequest();
    xhr.open("POST", `${config.SERVER_URL}/transcribe`);
    xhr.onreadystatechange = () => {
      if (xhr.status === 200) {
        // initiate server api polling
        this.setState({ converting: true }, () => this.pollJob());
      } else {
        // converting failed, tell user
        this.setState({ converting: false, failed: true, jobID: "" });
      }
    };

    // Initiate an upload and save reference ID
    const formData = new FormData();
    var reader = new FileReader();
    reader.onload = evt => {
      formData.append("file", evt.target.result);
      const jobID = shortid.generate();
      formData.append("jobID", jobID);
      xhr.send(formData);
      this.setState({ jobID });
    };
    reader.readAsDataURL(file);
  };

  /**
   * the conversion process takes a long time. this repeatedly polls an endpoint
   * on the server at an ID created client-side, waiting until there's a response
   * (saying that it's ready or that it failed)
   */
  pollJob = () => {
    if (this.state.converting && this.state.jobID) {
      console.log("...polling");
      // poll server
      var xhr = new XMLHttpRequest();
      xhr.open("POST", `${config.SERVER_URL}/results`);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            // conversion complete, download and stop polling
            const result = JSON.parse(xhr.response);
            const { transcript } = result;

            // download the file transcript
            console.log(transcript);
            const data = new Blob([transcript], {
              type: "text/plain;charset=utf-8"
            });
            console.log(data);
            saveAs(data, "result.txt");
            this.setState({ converting: false, jobID: "" });
            return;
          } else if (xhr.status === 202) {
            // wait fifteen seconds and try again
            setTimeout(() => {
              this.pollJob();
            }, 15000);
          } else {
            // converting failed, tell user
            this.setState({ converting: false, failed: true });
          }
        }
      };
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send(`jobID=${this.state.jobID}`);
    }
  };

  render() {
    return (
      <Dropzone
        accept="audio/*"
        onDrop={this.sendFiles}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ margin: "auto" }}>
          <h1>TRANSCRIBE AUDIO FILES</h1>
          <label htmlFor="file" onClick={e => e.stopPropagation()}>
            <strong>Choose a file </strong>
            or drag it here...
          </label>

          <input
            type="file"
            id="file"
            accept="audio/*"
            ref={ref => (this.input = ref)}
            onClick={e => e.stopPropagation()}
            onChange={e => {
              e.stopPropagation();
              this.sendFiles(e.target.files);
            }}
          />
        </div>
      </Dropzone>
    );
  }
}
