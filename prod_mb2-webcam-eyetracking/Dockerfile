FROM debian:buster-slim

RUN apt-get update && apt-get upgrade -y && apt-get install -y apache2 php && a2enmod ssl
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["bash", "/entrypoint.sh"]