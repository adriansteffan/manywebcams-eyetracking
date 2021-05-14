#!/bin/bash
set -e

cd ..
./build.sh
cp -r local-server/webroot prod
cd prod
docker-compose build --no-cache
docker-compose up -d
chown 33:33 -R data
