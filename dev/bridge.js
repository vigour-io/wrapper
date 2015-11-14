'use strict'
var devBridge = require('vigour-wrapper/lib/bridge')

var devNativePlugins = {
  ChromeCast: {
    init (data) {
      setTimeout(() => {
        window.vigour.native.bridge.ready(null, true, 'ChromeCast')
        /// start device scans event with timeout
        startFakeDevicesScan()
      }, 100)
    },
    connect (deviceId) {
      // sender start session
      // start casting once connected
      setTimeout(() => {
        startCasting(deviceId)
      }, 100)

    },
    disconnect () {
      // sender stop session
      // stop casting
      setTimeout(() => {
        stopCasting()
      }, 100)
    }
  }
}

devBridge.send = function (pluginId, fnName, opts, cb) {
  if (fnName !== 'set') {
    devNativePlugins[pluginId][fnName](opts, cb)
  }
}

// fake, used for dev
var stopCasting = () => {
  window.vigour.native.bridge.receive(null, {type: 'disconnected'}, 'ChromeCast')
}

// fake, used for dev
var startCasting = (deviceId) => {
  window.vigour.native.bridge.receive(null, {type: 'connected', data: deviceId}, 'ChromeCast')
}

// fake, used for dev
var startFakeDevicesScan = () => {
  var devices = [
    {id: 1, name: 'name01'},
    {id: 2, name: 'name02'},
    {id: 3, name: 'name03'}]
  let iter = (device) => {
    if (!device) return
    setTimeout(() => {
      window.vigour.native.bridge.receive(null, {type: 'join', data: device}, 'ChromeCast')
      iter(devices.shift())
    }, 100)
  }
  iter(devices.shift())
}

module.exports = devBridge
