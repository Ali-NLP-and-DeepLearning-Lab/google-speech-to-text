#!/bin/bash
<<<<<<< HEAD
npm run build
=======
>>>>>>> 3dc597aec54a55ce9aaa14b5dbd7cb1df80a8050

EC2="ubuntu@ec2-54-146-44-63.compute-1.amazonaws.com:/home/ubuntu/speech-translate"
LOC="ubuntu@ec2-54-146-44-63.compute-1.amazonaws.com"

# sync this directory with /speech-translate on EC2
rsync -r --exclude "node_modules/" "." $EC2 &&
ssh -t $LOC "cd speech-translate ; npm install --only=production" &&
<<<<<<< HEAD
ssh -t $LOC "cd speech-translate ; sudo npm run serve"
=======
ssh -t $LOC "cd speech-translate ; npm run serve"
>>>>>>> 3dc597aec54a55ce9aaa14b5dbd7cb1df80a8050
