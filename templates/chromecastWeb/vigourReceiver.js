"use strict";
console.log('### Application Loaded. Starting system.');

(function () {
  var mgr
  var appConfig
  var mediaElement
  var mediaManager

  window.onload = function () {
    mgr = cast.receiver.CastReceiverManager.getInstance();
    mediaManager = new cast.receiver.MediaManager(window.mediaElement);
    mediaElement = document.getElementById('media');

    appConfig = new cast.receiver.CastReceiverManager.Config();
    appConfig.statusText = 'MTV Play Cast!';
    appConfig.maxInactivity = 6000;
    mgr.onReady = function(event) {
        console.error("### Cast Receiver Manager is READY: " + JSON.stringify(event));
        window.sessionId = event.data.sessionId
    }
    mgr.start();
  }
})();
