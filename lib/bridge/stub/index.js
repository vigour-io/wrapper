'use strict'

var bridge = require('../')

module.exports = exports = {}

exports.send = function (pluginId, fnName, opts, cbId, cb) {
  setTimeout(function () {
    window.vigour.native.bridge.result(cbId, null, opts)
  }, 200)
}

setTimeout(function () {
  window.vigour.native.bridge.ready(null, {})
  for (var key in bridge.plugins) {
    window.vigour.native.bridge.ready(null, {}, key)
  }
}, 1000)
