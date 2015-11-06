"use strict";
console.log('### Application Loaded. Starting system.');

(function () {
  var mgr
  var mediaElement
  var mediaManager

  window.onload = function () {
    mediaElement = document.getElementById('media');
    mediaManager = new cast.receiver.MediaManager(mediaElement);
    mgr = cast.receiver.CastReceiverManager.getInstance();
    mgr.start();
  }
})();
