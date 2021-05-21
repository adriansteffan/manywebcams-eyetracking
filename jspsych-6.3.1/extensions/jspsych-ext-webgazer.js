jsPsych.extensions['webgazer'] = (function () {

  var extension = {};

  // private state for the extension
  // extension authors can define public functions to interact
  // with the state. recommend not exposing state directly
  // so that state manipulations are checked.
  var state = {};

  var scaleToScreen= function(aoi){

    var browserAspectRatio = window.innerWidth/window.innerHeight;

    var scaleFactor = aoi.stimulusAspectRatio/browserAspectRatio;
    
    var scalex = 1;
    var scaley = 1;
    if(scaleFactor <= 1){ // stimulus has bars on the sides
      scalex = scaleFactor;
    }else{ // stimulus has bars on top and bottom
      scaley = 1/scaleFactor;
    }

    var offsetx = (window.innerWidth*(1-scalex))/2;
    var offsety = (window.innerHeight*(1-scaley))/2;;

    aoi.posx = (aoi.rposx*window.innerWidth)*scalex+offsetx;
    aoi.posy = (aoi.rposy*window.innerHeight)*scaley+offsety;

    aoi.width = aoi.rwidth*window.innerWidth*scalex;
    aoi.height = aoi.rheight*window.innerHeight*scaley;

  }

  // required, will be called at jsPsych.init
  // should return a Promise
  extension.initialize = function (params) {
    // setting default values for params if not defined
    params.round_predictions = typeof params.round_predictions === 'undefined' ? true : params.round_predictions;
    params.auto_initialize = typeof params.auto_initialize === 'undefined' ? false : params.auto_initialize;
    params.sampling_interval = typeof params.sampling_interval === 'undefined' ? 34 : params.sampling_interval;

    return new Promise(function (resolve, reject) {
      if (typeof params.webgazer === 'undefined') {
        if (window.webgazer) {
          state.webgazer = window.webgazer;
        } else {
          reject(new Error('Webgazer extension failed to initialize. webgazer.js not loaded. Load webgazer.js before calling jsPsych.init()'));
        }
      } else {
        state.webgazer = params.webgazer;
      }

      // sets up event handler for webgazer data
      state.webgazer.setGazeListener(handleGazeDataUpdate);

      // default to threadedRidge regression
      // NEVER MIND... kalman filter is too useful.
      //state.webgazer.workerScriptURL = 'js/webgazer/ridgeWorker.mjs';
      //state.webgazer.setRegression('threadedRidge');
      //state.webgazer.applyKalmanFilter(false); // kalman filter doesn't seem to work yet with threadedridge.

      // set state parameters
      state.round_predictions = params.round_predictions;
      state.sampling_interval = params.sampling_interval;

      // sets state for initialization
      state.initialized = false;
      state.activeTrial = false;
      state.gazeUpdateCallbacks = [];
      state.domObserver = new MutationObserver(mutationObserverCallback);

      // hide video by default
      extension.hideVideo();

      // hide predictions by default
      extension.hidePredictions();

      if (params.auto_initialize) {
        // starts webgazer, and once it initializes we stop mouseCalibration and
        // pause webgazer data.
        state.webgazer.begin().then(function () {
          state.initialized = true;
          extension.stopMouseCalibration();
          extension.pause();
          resolve();
        }).catch(function (error) {
          console.error(error);
          reject(error);
        });
      } else {
        resolve();
      }
    })
  }

  // required, will be called when the trial starts (before trial loads)
  extension.on_start = function (params) {

    //make params accessible to all functions in the file
    state.params = params;

    state.currentTrialData = [];
    state.currentTrialTargets = {};
    state.currentTrialSelectors = params.targets;


    if(params.aoiData && params.aoiData.debug){

      state.overlayCanvas = document.createElement('canvas');
      state.overlayCanvas.id = "jspsych-webgazer-overlay-canvas";
      
      let ctx = state.overlayCanvas.getContext("2d");

      state.overlayCanvas.width = window.innerWidth * window.devicePixelRatio;
      state.overlayCanvas.height = window.innerHeight * window.devicePixelRatio;
      state.overlayCanvas.style.width = window.innerWidth;
      state.overlayCanvas.style.height = window.innerHeight;

      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      document.body.appendChild(state.overlayCanvas);

      params.aoiData.aois.forEach((aoi) => scaleToScreen(aoi));

    }

    state.domObserver.observe(jsPsych.getDisplayElement(), {childList: true})
    
  }

  // required will be called when the trial loads
  extension.on_load = function (params) {

    // set current trial start time
    state.currentTrialStart = performance.now();

    // resume data collection
    // state.webgazer.resume();

    extension.startSampleInterval();

    // set internal flag
    state.activeTrial = true;
  }

  // required, will be called when jsPsych.finishTrial() is called
  // must return data object to be merged into data.
  extension.on_finish = function (params) {
    
    // pause the eye tracker
    extension.stopSampleInterval();

    // stop watching the DOM
    state.domObserver.disconnect();

    // state.webgazer.pause();

    // set internal flag
    state.activeTrial = false;

    if(state.params && state.params.aoiData && state.params.aoiData.debug){
      state.overlayCanvas.remove();
    }

    if(params.aoiData.aois){
      state.currentTrialData.forEach(
        (datapt) => {
          params.aoiData.aois.forEach((aoi) => {

            scaleToScreen(aoi);
            if(
              (aoi.startat && datapt.t < aoi.startat) || // inactive
              (aoi.stopat && datapt.t > aoi.stopat) ||
              (aoi.type === "circle" && ((aoi.posx - datapt.x) ** 2 + (aoi.posy - datapt.y) ** 2 > aoi.radius**2)) || // not hit
              (aoi.type === "rect" && 
                !(aoi.posx < datapt.x &&
                  datapt.x < aoi.posx + aoi.width &&
                   aoi.posy < datapt.y &&
                    datapt.y < aoi.posy + aoi.height
                )
              )
            ){return;}
  
            if(!datapt.hitAois){datapt.hitAois = [];}
            datapt.hitAois.push(aoi.name);
  
          });
        }
      );
    }
    
    let gazeData = {
      webgazer_data: state.currentTrialData,
      webgazer_targets: state.currentTrialTargets 
    }
    if(params && params.aoiData && params.aoiData.aois) {
      gazeData.aois = params.aoiData.aois;
    }
    // send back the gazeData
    return gazeData;
  }

  extension.start = function () {
    if(typeof state.webgazer == 'undefined'){
      console.error('Failed to start webgazer. Things to check: Is webgazer.js loaded? Is the webgazer extension included in jsPsych.init?')
      return;
    }
    return new Promise(function (resolve, reject) {
      state.webgazer.begin().then(function () {
        state.initialized = true;
        extension.stopMouseCalibration();
        extension.pause();
        resolve();
      }).catch(function (error) {
        console.error(error);
        reject(error);
      });
    });
  }

  extension.startSampleInterval = function(interval){
    interval = typeof interval == 'undefined' ? state.sampling_interval : interval;
    state.gazeInterval = setInterval(function(){
      state.webgazer.getCurrentPrediction().then(handleGazeDataUpdate);
    }, state.sampling_interval);
    // repeat the call here so that we get one immediate execution. above will not
    // start until state.sampling_interval is reached the first time.
    state.webgazer.getCurrentPrediction().then(handleGazeDataUpdate);
  }

  extension.stopSampleInterval = function(){
    clearInterval(state.gazeInterval);
  }

  extension.isInitialized = function(){
    return state.initialized;
  }

  extension.faceDetected = function () {
    return state.webgazer.getTracker().predictionReady;
  }

  extension.showPredictions = function () {
    state.webgazer.showPredictionPoints(true);
  }

  extension.hidePredictions = function () {
    state.webgazer.showPredictionPoints(false);
  }

  extension.showVideo = function () {
    state.webgazer.showVideo(true);
    state.webgazer.showFaceOverlay(true);
    state.webgazer.showFaceFeedbackBox(true);
  }

  extension.hideVideo = function () {
    state.webgazer.showVideo(false);
    state.webgazer.showFaceOverlay(false);
    state.webgazer.showFaceFeedbackBox(false);
  }

  extension.resume = function () {
    state.webgazer.resume();
  }

  extension.pause = function () {
    state.webgazer.pause();
    // sometimes gaze dot will show and freeze after pause?
    if(document.querySelector('#webgazerGazeDot')){
      document.querySelector('#webgazerGazeDot').style.display = 'none';
    }
  }

  extension.resetCalibration = function(){
    state.webgazer.clearData();
  }

  extension.stopMouseCalibration = function () {
    state.webgazer.removeMouseEventListeners()
  }

  extension.startMouseCalibration = function () {
    state.webgazer.addMouseEventListeners()
  }

  extension.calibratePoint = function (x, y) {
    state.webgazer.recordScreenPosition(x, y, 'click');
  }

  extension.setRegressionType = function (regression_type) {
    var valid_regression_models = ['ridge', 'weightedRidge', 'threadedRidge'];
    if (valid_regression_models.includes(regression_type)) {
      state.webgazer.setRegression(regression_type)
    } else {
      console.warn('Invalid regression_type parameter for webgazer.setRegressionType. Valid options are ridge, weightedRidge, and threadedRidge.')
    }
  }

  extension.getCurrentPrediction = function () {
    return state.webgazer.getCurrentPrediction();
  }

  extension.onGazeUpdate = function(callback){
    state.gazeUpdateCallbacks.push(callback);
    return function(){
      state.gazeUpdateCallbacks = state.gazeUpdateCallbacks.filter(function(item){
        return item !== callback;
      });
    }
  }

  function handleGazeDataUpdate(gazeData, elapsedTime) {

    if (gazeData !== null){
      var d = {
        x: state.round_predictions ? Math.round(gazeData.x) : gazeData.x,
        y: state.round_predictions ? Math.round(gazeData.y) : gazeData.y,
        t: gazeData.t
      }
      if(state.activeTrial) {
        //console.log(`handleUpdate: t = ${Math.round(gazeData.t)}, now = ${Math.round(performance.now())}`);
        d.t = Math.round(gazeData.t - state.currentTrialStart)
        state.currentTrialData.push(d); // add data to current trial's data
      }
      state.currentGaze = d;
      for(var i=0; i<state.gazeUpdateCallbacks.length; i++){
        state.gazeUpdateCallbacks[i](d);
      }


      /* redraw area of interest in debugging mode
       (the edraw is necessary because some aois might only appear for a short while) */ 
      if(state.params && state.params.aoiData && state.params.aoiData.debug){
        let ctx = state.overlayCanvas.getContext("2d");
        ctx.clearRect(0, 0, window.innerWidth, window.innerWidth);

        state.params.aoiData.aois.forEach(
          (aoi) => {
            let t = Math.round(gazeData.t - state.currentTrialStart);
            if((aoi.startat && t < aoi.startat) || (aoi.stopat && t > aoi.stopat)){
              return;
            }

            ctx.fillStyle = aoi.debugColor;
            if(aoi.type === "rect"){
              ctx.fillRect(aoi.posx, aoi.posy, aoi.width, aoi.height);
          
            }else if(aoi.type === "circle"){
              ctx.beginPath();
              ctx.arc(aoi.posx, aoi.posy, aoi.radius, 0, 2 * Math.PI);
              ctx.fill();
            }
            
          }
        );
      }

    } else {
      state.currentGaze = null;
    }
  }

  function mutationObserverCallback(mutationsList, observer){
    for(const selector of state.currentTrialSelectors){
      if(!state.currentTrialTargets[selector]){
        if(jsPsych.getDisplayElement().querySelector(selector)){
          var coords = jsPsych.getDisplayElement().querySelector(selector).getBoundingClientRect();
          state.currentTrialTargets[selector] = coords;
        }
      }
    }
  }

  return extension;

})();

