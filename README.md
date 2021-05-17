# MB2 Online Eyetracking Pilot: Knowledge vs Ignorance 

This repository is created as a part of the [ManyBabies2](https://manybabies.github.io/MB2/) project, a collaborative effort that investigates Theory of Mind (the ability to ascribe mental states to agents) in infants.

The code in this repo is used to run an online pilot study that aims to further test the reliability of implicit/non-verbal ToM measures based on eye tracking.
Due to the restrictions of the pandemic, conducting in-lab studies using conventional eye trackers is considerably more difficult than usual. We therefore employ an in-browser solution to determine if webcam-based eye tracking can help partially answer some of our questions regarding implicit ToM measures. 

(Todo: Link to relevant article, better description of trials presented, better description of what to do if someone wants to replicate this in their lab)

## Table of Contents

* [Installation](#Prerequisites)
  * [Prerequisites](#Prerequisites)
  * [Deployment](#Deployment)
  * [Development Setup](#Prerequisites)
* [Usage](<#Usage-Instructions>)
  * [URL parameters](<#URL-parameters>)
  * [Saved data](<#Saved-data>)
* [Misc](<#Built-with>)
  * [Built with](<#Built-with>)
  * [Changes to jsPsych-6.3.1](<#Changes-to-jsPsych-6.3.1>)
  * [Authors](#Authors)
  * [License](#License)



## Prerequisites

As this repository contains video files served over github lfs, the [git-lfs](https://git-lfs.github.com/) extension needs to be installed and activated.

[Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) are needed for both deployment and development.

This project was developed and deployed on MacOS and Ubuntu systems. A setup guide for Microsoft Windows is in the works.


## Deployment

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

### Setup 

As webgazers requires the usage of the https protocol, you will need a local server for development. This project comes with a [docker-compose.yml](docker-compose.yml) file that takes care of the setup and configuration.

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

## Usage Instructions

### URL parameters
After deploying the container, there are a few options for the execution of the online experiment that can be configured using url paramters.

For example, to if you want the output data to be linked to a participant with the id "participant1", and want to choose the stimulus order "Trial order 5", you use the following link: 


```
yoururl.com?id=participant1&trial_order=5
```

The following table gives you an overview of all available parameters:

| url parameter  | possible values| default value |  description |
| ------------- | ------------- | ------------- | ------------- |
| id  | string | a randomly generated uuid  | the id that is attached to the output data, used to identify a participant|
| trial_order  | integer (1-32) | a random value between 1 and 32 | the choice and order of stimuli as specified by the proposal paper |
| show_aoi  | true/false | false | a flag to indicate whether the aois should be overlayed over the stimuli (for debugging purposes) |
| download_data  | true/false | false | a flag to indicate whether the browser should download a the generated data after the trial finishes |
| prevent_upload  | true/false | false | a flag to indicate if the upload of trial data to the server should be prevented|
| print_data  | true/false | false | a flag to indicate if the trial data json should be displayed in the browser after the trial finishes|

### Saved data

The data that was uploaded by the participants browsers can be found in `prod/data`. There are two types of files, generated for every participant:

* A **json** data file containing all of the experiment data generated by jsPsych. It is named `[id]_[trial_order]_data.json`
* **Video** data files containing the webcam recording for each of the individual trials. They are named `[id]_[trial_order]_[trialname].webm`


## Built With

  - [jsPsych](https://www.jspsych.org/) - A modified version of jspsych-6.3.1 is used for the general trial structure and webgazers integration
  - [webgazers.js](https://webgazer.cs.brown.edu/) - The eye tracking library used to capture gaze coordinated via a webcam

## Changes to jspsych-6.3.1

* Changed the `webgazer` extension in `jspsych-6.3.1/extensions/jspsych-ext-webgazer.js`. It now has additional parameters for defining areas of interest (AOI). These AOIs tag all datapoints of the webgazer output that fall into the correspong AOI. With an url paramter flag they can also be displayed for debugging purposes.

* Added a `webcam-recorder` extension in `jspsych-6.3.1/extensions/jspsych-ext-webcam-recorder.js`. It can be used to record the participants webcam on a trial by trial basis. (Until a better solution is found, the video blobs get saved to window.webcamVideoBlobs for further processing)

* Added a `background-audio` extension in `jspsych-6.3.1/extensions/jspsych-ext-background-audio.js`. It can be used to add a looping audio file (currently hardcoded) to the background of any trial.

* Changed `jspsych-6.3.1/plugins/jspsych-webgazer-calibrate.js` and `jspsych-6.3.1/plugins/jspsych-webgazer-validate.js` to replace the dot with something more attention grabbing, making it better suited for infant research. (In the future, making this optional would be a good idea.)

## Authors

- **Adrian Steffan** [adriansteffan](https://github.com/adriansteffan)
<!-- - **Tobias Schuwerk** [tobiasschuwerk](https://github.com/tobiasschuwerk) -->


## License

This project is licensed under the [GNU GPLv3](LICENSE.md) - see the [LICENSE.md](LICENSE.md) file for
details


