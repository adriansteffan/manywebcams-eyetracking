# MB2 Online Eyetracking Study (Pilot)

This repository is created as a part of the [ManyBabies2](https://manybabies.github.io/MB2/) project, a collaborative effort that investigates Theory of Mind (the ability to ascribe mental states to agents) in infants.

WIP: What exactly this version does



## Prerequisites
---
[Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) are needed for both deployment and development.

This project was developed and deployed on MacOS and Ubuntu systems. A setup guide for Microsoft Windows is in the works.


## Deployment
---
After cloning the repository, you can build the project by running 

```
./build-container.sh
```

in the [prod](prod/) directory. 
This will automatically start the webserver serving the app, you can stop it with
```
docker-compose down
```

and later restart it with

```
docker-compose up -d
```

in the [prod](prod/) directory.

Depending on your setup, you might want to change the ip mapping in [prod/docker-compose.yml](prod/docker-compose.yml). I recommend leaving it the way it is and pointing an apache reverse proxy or something similar to the specified port.

## Development
---
### Setup 

As webgazers requires the usage of the https protocol, you will need a local server for development. This project comes with a docker-compose.yml file that takes care of the setup and configuration.

In order for https to work, we need an installation of open-ssl to create and sign a ssl certificate for localhost.

After installing open-ssl, run the following commands in the `local-server/config` directory:

```
openssl genrsa -des3 -out rootCA.key 2048

openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem

openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )

openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext
```

Afterwards, you need to add your newly created CA (rootca.pem) to the list of trusted CAs of your operating system. Instructions for that can be found [here](https://google.com).

As a final step, build the docker container for the webserver by running 
```
docker-compose build
```
in the root directory of the repository.

### Running the server

In order to run the development server, run 
```
docker-compose up -d
```

in the root directory. You can stop the server with 
```
docker-compose down
```

When initially cloning the project and after making changes , update the files in the local webroot by running

```
./build.sh
```

in the root directory.

## Built With

  - [jsPsych](https://www.jspsych.org/) - A modified version of jspsych-6.3.1 is used for the general trial structure and webgazers integration
  - [webgazers.js](https://webgazer.cs.brown.edu/) - The eye tracking library used to capture gaze coordinated via a webcam


## Authors

- **Adrian Steffan** [adriansteffan](https://github.com/adriansteffan)


## License

This project is licensed under[GNU GPLv3](LICENSE.md) - see the [LICENSE.md](LICENSE.md) file for
details


