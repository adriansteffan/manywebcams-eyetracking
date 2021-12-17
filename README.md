# Many Webcams Eyetracking

This repository is created as a part of Many Webcams, a [ManyBabies2](https://manybabies.github.io/MB2/) spinoff.

The code in this repo is used to run an online pilot study that aims to further test the reliability of webcam based eyetracking in infant reseearch. Due to the restrictions of the pandemic, conducting in-lab studies using conventional eye trackers is considerably more difficult than usual. We therefore employ an in-browser solution to determine if webcam-based eye tracking can help partially answer some of our questions regarding implicit ToM measures. 

(Todo: Longer description of the project, instructions for conducting experiments)

<p align="center">
<img src="demo.gif" width="500" >
</p>

## Table of Contents

* [Installation](#Prerequisites)
  * [Prerequisites](#Prerequisites)
  * [Deployment](#Deployment)
  * [Development Setup](#Prerequisites)
* [Usage](<#Usage-Instructions>)
  * [URL parameters](<#URL-parameters>)
  * [Saved data](<#Saved-data>)
  * [Visualization](<#Visualizing the eye tracking data >)
* [Misc](<#Built-with>)
  * [Built with](<#Built-with>)
  * [Changes to jsPsych-6.3.1](<#Changes-to-jsPsych-6.3.1>)
  * [Authors](#Authors)
  * [License](#License)



## Prerequisites

As this repository contains video files served over github lfs, the [git-lfs](https://git-lfs.github.com/) extension needs to be installed and activated.

[Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) are needed for both deployment and development (you can deploy this app without docker, but we highly recommend running separate containers for different experiments). 

If you want to use the visualization tool, you will need an [ffmpeg](https://www.ffmpeg.org/) installation and a [Python3](https://www.python.org/downloads/) installation. You will also need to run 
```
pip install -r requirements.txt
``` 
in the `data-processing` directory to install the necessary dependencies. This tool will be dockerized at a later date.

This project was developed and deployed on MacOS and Ubuntu systems. A setup guide for Microsoft Windows is in the works.


## Deployment

If you are partaking in a manybabies project and need a domain or assistance with setting up this experiment, contact [adriansteffan](https://github.com/adriansteffan) via [mail](mailto:adrian.steffan@hotmail.de).

If you want to provide a link where participants can upload their trial data if the upload to the server fails, you need to specify the link in `config.js`.

### With Docker (recommended)

After cloning the repository, you can build the project by running 

```
./build-container.sh
```

in the [prod_mb2-webcam-eyetracking](prod_mb2-webcam-eyetracking/) directory. 
This will automatically start the webserver serving the app, you can stop it with
```
docker-compose down
```

and later restart it with

```
docker-compose up -d
```

in the [prod_mb2-webcam-eyetracking](prod_mb2-webcam-eyetracking/) directory.

To make the container reachable from the internet, refer to [these instructions](https://gist.github.com/adriansteffan/48c9bda7237a8a7fcc5bb6987c8e1790) on how to set up your apache reverse proxy. Depending on your setup, you might want to change the ip mapping in [prod_mb2-webcam-eyetracking/docker-compose.yml](prod_mb2-webcam-eyetracking/docker-compose.yml).

### Without Docker 

Alternatively, you can use a webserver (like apache) running and configured on your machine. This server needs to be reachable via HTTPS and support PHP. 

On a fresh install, this would be achieved by running:
```
apt-get install -y apache2 php && a2enmod ssl
```

After cloning the repository, run

```
./build.sh
```

in the root directory. Afterwards, copy the contents of `local-server/webroot` to the webroot of your webserver by running 

```
cp local-server/webroot/* /var/www/html
```

Finally, the folder for the experiment data needs to be created by running

```
mkdir /var/www/data && chown -R www-data:www-data /var/www/data
```


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

For example, to if you want the output data to be linked to a participant with the id "participant1", and want to choose the stimulus order "Trial order A", you use the following link: 


```
yoururl.com?id=participant1&trial_order=A
```

The following table gives you an overview of all available parameters:

| url parameter  | possible values| default value |  description |
| ------------- | ------------- | ------------- | ------------- |
| lang  | string ("de" or "en") | "en"  | the language in which the instructions will be displayed |
| id  | string | a randomly generated uuid  | the id that is attached to the output data, used to identify a participant|
| trial_order  | character ("A" or "B") | a random choice of either "A" or "B" | the choice and order of stimuli as specified by the proposal paper |
| key  | string | null | A key in the [ManyKeys](https://github.com/adriansteffan/manykeys) format, used to encrypt the data before being transmitted to the server. If not present, the data will be stored on the server without encryption |
| show_aoi  | true/false | false | a flag to indicate whether the aois should be overlayed over the stimuli (for debugging purposes) |
| download_data  | true/false | false | a flag to indicate whether the browser should download a the generated data after the trial finishes |
| prevent_upload  | true/false | false | a flag to indicate if the upload of trial data to the server should be prevented|
| print_data  | true/false | false | a flag to indicate if the trial data json should be displayed in the browser after the trial finishes|

### Saved data

The data that was uploaded by the participants browsers can be found in `prod_mb2-webcam-eyetracking/data` (or var/www/data of you run the dockerless setup). There are two types of files, generated for every participant:

* A **json** data file containing all of the experiment data generated by jsPsych. It is named `[id]_[trial_order]_data.json`
* **Video** data files containing the webcam recording for each of the individual trials. They are named `[id]_[trial_order]_[trialname].webm`

### Preprocessing the eye tracking data and visualization

To preprocess and visualize the eye tracking data of each participant and facilitate the pre-screening of participant videos, you can use the script provided in the `data-processing` directory. The script expects the data of the participants to be located in `prod_mb2-webcam-eyetracking/data`, so if you are running a development setup, you will need to move your data there first.

#### No manual exclusion
If you just want to visualize all the data without manually excluding participants, run

```
python main.py
```

This will create an `output` folder next to the script, with seperate folders for each participant. In there you can find video files that overlay the eyetracking results over the stimulus videos and add the synchronized webcam video as well as beeswarm plots for all stimuli.

#### Manual exclusion (Manywebcams study)

If manual inspection and exclusion of certain trials are required, start by running 

```
python main.py t
```

This will create an `output` folder next to the script, with seperate folders for each participant. In there you can find video files that overlay the eyetracking results over the stimulus videos and add the synchronized webcam video.

Next, rename the `example_excluded_trials.csv` to `excluded_trials.csv`. For every participant, look through the newly rendered videos and specify what trials to include or exclude by putting 'yes' or 'no' in the corresponding fields.

TODO: specify exact exclusion criteria / specify multi-rater system

After deciding what trials to include/exlcude, run 
```
python main.py p
```

to generate the files suitable for analysis in R or SPSS.

Finally, 
```
python main.py b
```

will create the beeswarm plots for all the stimuli videos, excluding all participant trials specified in `excluded_trials.csv`.

## Built With

  - [jsPsych](https://www.jspsych.org/) - A modified version of jspsych-6.3.1 is used for the general trial structure and webgazers integration
  - [webgazers.js](https://webgazer.cs.brown.edu/) - The eye tracking library used to capture gaze coordinated via a webcam

## Changes to jspsych-6.3.1

* Changed the `webgazer` extension in `jspsych-6.3.1/extensions/jspsych-ext-webgazer.js`. It now has additional parameters for defining areas of interest (AOI). These AOIs tag all datapoints of the webgazer output that fall into the correspong AOI. With an url paramter flag they can also be displayed for debugging purposes.

* Added a `webcam-recorder` extension in `jspsych-6.3.1/extensions/jspsych-ext-webcam-recorder.js`. It can be used to record the participants webcam on a trial by trial basis. (Until a better solution is found, the video blobs get saved to window.webcamVideoBlobs for further processing)

* Added a `background-audio` extension in `jspsych-6.3.1/extensions/jspsych-ext-background-audio.js`. It can be used to add a looping audio file (currently hardcoded) to the background of any trial.

* Changed `jspsych-6.3.1/plugins/jspsych-webgazer-calibrate.js` and `jspsych-6.3.1/plugins/jspsych-webgazer-validate.js` to optionally replace the dot with something more attention grabbing and add background audio, making it better suited for infant research.

## Authors

- **Adrian Steffan** [adriansteffan](https://github.com/adriansteffan) [website](https://adriansteffan.com/)

## License

This project is licensed under the [GNU GPLv3](LICENSE.md) - see the [LICENSE.md](LICENSE.md) file for
details


