jsPsych.extensions['webcam-recorder'] = (function () {

    var extension = {};

    var state = {}; 


    // storing the video blobs in a global variable
    // this is a hacky workaround to access the video when saving data in the end.
    // horrible design for sure, but there does not seem to be a way to share arbitrary objects across trials
    // in a non-synchronous fashion.

    window.webcamVideoBlobs = window.webcamVideoBlobs ? window.webcamVideoBlobs : [];

    extension.initialize = function(params){
      //check if getUserMedia is accessible, inform user if browser in non compatible 
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        alert("Incomapible browser");
      }
    }
  
    extension.on_start = function(params){
        
        var recording = document.createElement('video');
        recording.style.display = 'none';
        recording.muted = true;
        document.body.append(recording);

        navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) => {
            recording.srcObject = stream;
            recording.captureStream = recording.captureStream || recording.mozCaptureStream;
            return recording.play();
        }).then(() => {
            state.recorder = new MediaRecorder(recording.captureStream());
            let data = [];
    
            state.recorder.ondataavailable = event => data.push(event.data);
            state.recorder.start();
    
            let stopped = new Promise((resolve, reject) => {
                state.recorder.onstop = resolve;
                state.recorder.onerror = event => reject(event.name);
            });
    
            return Promise.all([ stopped ]).then(() => data);
        }).then ((recordedChunks) => {

          window.webcamVideoBlobs.push({
            name: params.videoName ? params.videoName : "video",
            blob: new Blob(recordedChunks, {
              type: "video/webm"
            }),
          });

          recording.remove()
          
        });
    
    }
  
    extension.on_load = function(params){}
  
    extension.on_finish = function(params){
      if(state.recorder){
          if(state.recorder.state == "recording"){
            state.recorder.stop();
          }
      }
      
      return {}
    }
    
    return extension;
  })();
