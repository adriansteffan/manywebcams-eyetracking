jsPsych.extensions['background-audio'] = (function () {

  var extension = {};

  var state = {}; 

  var audioElement;

  extension.initialize = function(params){
    
  }

  extension.on_start = function(params){
    audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'media/audio/ding.wav');
    audioElement.setAttribute('autoplay', 'autoplay');
    audioElement.loop = true;
    audioElement.onpause = audioElement.remove;
    audioElement.play(); 
  
  }

  extension.on_load = function(params){}

  extension.on_finish = function(params){
    audioElement.pause();
    return {}
  }
  
  return extension;
})();
