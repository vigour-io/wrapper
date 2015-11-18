"use strict";
console.log('### Application Loaded. Starting system.');

(function () {

  var mediaElement
  var mediaManager
  var appData
  window.onload = function () {
    mediaElement = document.getElementById('media');
    mediaManager = new cast.receiver.MediaManager(mediaElement);
    window.mgr = cast.receiver.CastReceiverManager.getInstance();
    window.mgr.onReady = function (a) {
      appData = window.mgr.getApplicationData()
      document.getElementById('test').innerHTML = "Session ID" +  appData.sessionId
    }
    window.mgr.start();
  }
})();
