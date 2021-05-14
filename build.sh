#!/bin/bash

cp -r jspsych-6.3.1 local-server/webroot
cp src/experiment.html local-server/webroot/index.html
cp src/patch.css local-server/webroot/patch.css
cp src/write_data.php local-server/webroot/write_data.php
cp -r media local-server/webroot