#!/bin/bash
npm run build

EC2="ubuntu@ec2-54-146-44-63.compute-1.amazonaws.com:/home/ubuntu/speech-translate"
LOC="ubuntu@ec2-54-146-44-63.compute-1.amazonaws.com"

# sync this directory with /speech-translate on EC2
rsync -r --exclude "node_modules/" "." $EC2 &&
ssh -t $LOC "cd speech-translate ; npm install --only=production" &&
ssh -t $LOC "cd speech-translate ; sudo npm run serve"
