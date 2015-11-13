'use strict'
var devBridge = require('../lib/bridge')

var devNativePlugins = {
  ChromeCast: {
    init (data) {
      if (data && data.appId) console.log('---- Chromecast Sender [' + data.appId + ']')
      else console.log('---- Chromecast Receiver')
      setTimeout(() => {
        window.vigour.native.bridge.ready(null, true, 'ChromeCast')
      }, 500)
    },
    connect (deviceId) {
      window.vigour.native.bridge.receive(null, {
        type: 'join',
        data: {
          id: deviceId,
          name: name
        }
      }, 'Chromecast')
    },
    disconnect () {}
  }
}

devBridge.send = function (pluginId, fnName, opts, cb) {
  if (fnName !== 'set') {
    devNativePlugins[pluginId][fnName](opts, cb)
  }
}

module.exports = devBridge
