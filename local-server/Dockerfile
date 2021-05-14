FROM debian:buster-slim

RUN apt-get update && apt-get upgrade -y && apt-get install -y apache2 php && a2enmod ssl && mkdir /output && chown -R www-data:www-data output

COPY config/server.crt /etc/apache2
COPY config/server.key /etc/apache2

COPY config/default-ssl.conf /etc/apache2/sites-available
RUN a2ensite default-ssl

ENTRYPOINT [ "apachectl", "-D", "FOREGROUND" ]