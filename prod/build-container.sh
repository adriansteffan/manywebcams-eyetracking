#!/bin/bash
set -e
set -o

cd ..
./build.sh
cd prod
docker-compose build --no-cache
docker-compose up -d