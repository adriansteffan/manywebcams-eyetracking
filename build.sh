#!/bin/bash

cp -r jspsych-6.3.1 local-server/webroot
cp -r src/* local-server/webroot
cp -r media local-server/webroot
cp config.js local-server/webroot

mv local-server/webroot/experiment.html local-server/webroot/index.html