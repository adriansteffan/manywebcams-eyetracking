#!/bin/bash
if [ ! -d "/var/www/data" ]; then
    echo "/var/www/data does not exist. Is the folder mount setup correctly in docker-compose.yml?"
    exit 1
fi

chown -R www-data:www-data /var/www/data
chmod -R 777 /var/www/data

apachectl -D FOREGROUND