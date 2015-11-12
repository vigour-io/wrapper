'use strict'
var devBridge = require('../lib/bridge')

var devNativePlugins = {
  ChromeCast: {
    init () {
      window.vigour.native.bridge.ready(null, true, 'ChromeCast')
      setTimeout(function(){
        window.vigour.native.bridge.receive(null, {joined: {id: 'asdf23'}}, 'ChromeCast')
      }, this.timeout)
    }
  },
  timeout: 1000
}

devBridge.send = function (pluginId, fnName, opts, cb) {
  devNativePlugins[pluginId][fnName](opts, cb)
}
