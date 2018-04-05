#!/bin/bash
npm run build &&

aws s3 sync ./build s3://google-transcribe \
--acl public-read \
--sse --delete \
--cache-control max-age=604800,public