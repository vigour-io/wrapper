'use strict'

var bridge = require('./')

module.exports = function (pluginId) {
  return function (base) {
    bridge.registerPlugin(pluginId, base)
    base.set({
      properties: {
        bridge: {
          val: bridge
        }
      },
      define: {
        send (methodName, params, cb) {
          bridge.send(pluginId, methodName, params, cb)
        }
      }
    })
  }
}
