'use strict'
var devBridge = require('../lib/bridge')

var devNativePlugins = {
  ChromeCast: {
    init (data) {
      console.log('init', data)
      setTimeout(() => {
        window.vigour.native.bridge.ready(null, true, 'ChromeCast')
        /// start device scans event with timeout
        // startFakeDevicesScan()
      }, 100)
    },
    connect (deviceId) {
      // sender start session
      // timeout(receive(event: type: connected))
    },
    disconnect () {
      // sender stop session
      // timeout(receive(event: type: disconnected))
    }
  }
}

devBridge.send = function (pluginId, fnName, opts, cb) {
  if (fnName !== 'set') {
    devNativePlugins[pluginId][fnName](opts, cb)
  }
}

// Fake fuction, used for dev
function startFakeDevicesScan () {
  var devices = [
    {id: 1, name: 'name01'},
    {id: 2, name: 'name02'},
    {id: 3, name: 'name03'}]
  let iter = (device) => {
    console.log('iter', device)
    if (!device) return
    setTimeout(() => {
      window.vigour.native.bridge.receive(null, {type: 'join', data: device}, 'ChromeCast')
      iter(devices.shift())
    }, 100)
  }
  iter(devices.shift())
}

module.exports = devBridge
