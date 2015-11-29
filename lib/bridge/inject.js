'use strict'

var bridge = require('./')

module.exports = function (pluginId) {
  return function (base) {
    bridge.plugins[pluginId] = base
    base.set({
      define: {
        send (methodName, params, cb) {
          bridge.send(pluginId, methodName, params, cb)
        }
      }
    })
  }
}
