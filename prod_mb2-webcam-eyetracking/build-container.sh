#!/bin/bash
set -e

cd ..
./build.sh
cp -r local-server/webroot prod_mb2-webcam-eyetracking
cd prod_mb2-webcam-eyetracking
docker-compose build --no-cache
docker-compose up -d
chown 33:33 -R data
