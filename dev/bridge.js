'use strict'
var devBridge = require('../lib/bridge')
var bridge = window.vigour.native.bridge
var Promise = require('bluebird')

var devNativePlugins = {
  ChromeCast: {
    init (data) {
      setTimeout(() => {
        // setup plugin and send ready
        bridge.ready(null, true, 'ChromeCast')
        /// start device scans event with timeout
        startFakeDevicesScan()
      })
    },
    connect (deviceId) {
      // sender start session
      // start casting once connected
      setTimeout(() => {
        startCasting(deviceId)
      })
    },
    disconnect () {
      // sender stop session
      // stop casting
      setTimeout(() => {
        stopCasting()
      })
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
  bridge.receive(null, {type: 'disconnected'}, 'ChromeCast')
}

// fake, used for dev
var startCasting = (deviceId) => {
  bridge.receive(null, {type: 'connected', data: deviceId}, 'ChromeCast')
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
      bridge.receive(null, {type: 'join', data: device}, 'ChromeCast')
      iter(devices.shift())
    })
  }
  iter(devices.shift())
}

module.exports = devBridge
