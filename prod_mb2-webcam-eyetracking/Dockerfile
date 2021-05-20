FROM debian:buster-slim

RUN apt-get update && apt-get upgrade -y && apt-get install -y apache2 php && a2enmod ssl
RUN mkdir /var/www/data && chown -R www-data:www-data /var/www/data

COPY webroot /var/www/html

ENTRYPOINT [ "apachectl", "-D", "FOREGROUND" ]
