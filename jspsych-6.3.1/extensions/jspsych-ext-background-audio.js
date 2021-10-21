jsPsych.extensions['background-audio'] = (function () {

  /**
   * Loops an audio file in the background during a trial
   * 
   * Params:
   *  audioSrc: path to audio file
   *  loopDuration: How long a loop should last (currently only supports values longer than the provided file)
   */
  var extension = {};

  var state = {}; 

  var audioElement;

  extension.initialize = function(params){}

  extension.on_start = function(params){
    
    params.audioSrc = params.audioSrc ? params.audioSrc : 'media/audio/ding.wav';

    audioElement = document.createElement('audio');
    audioElement.setAttribute('preload','auto');
    audioElement.setAttribute('src', params.audioSrc);
    audioElement.setAttribute('autoplay', 'autoplay');
    audioElement.loop=true;
    
    audioElement.onloadedmetadata = function() {

      audioDurationMS = audioElement.duration*1000;
      params.loopDuration = params.loopDuration ? params.loopDuration : audioDurationMS;

      audioElement.onended = function(){
        this.currentTime = 0;
      var delay = setTimeout(function(){
        audioElement.play();
        clearTimeout(delay);
      }, params.loopDuration - audioDurationMS);
    }

    audioElement.onpause = audioElement.remove;

    };
  }

  extension.on_load = function(params){
      audioElement.play();
  }

  extension.on_finish = function(params){
    audioElement.pause();
    return {}
  }
  
  return extension;
})();
