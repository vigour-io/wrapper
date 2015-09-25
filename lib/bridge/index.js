var set = require('lodash/object/set')
var env = require('../env')

var platform
// TODO Eliminate code for other platforms during build process
switch (env.platform) {
  case 'ios':
    platform = require('./ios')
    break
  case 'android':
    platform = require('./android')
    break
  default:
    platform = false
    break
}
var unsupportedPlatformError = new Error('Unsupported platform')
unsupportedPlatformError.info = {
  platform: env.platform
}

var callbackMap = {}
var callbackId = 0

var ready = {}
var pending = {}

module.exports = exports = {}

/**
  opts is optional
  call is wrapped in try, so try not needed on caller side
*/
exports.send = function (pluginId, fnName, opts, cb) {
  console.log('send called with ', this.args)
  if (platform) {
    if (ready[pluginId]) {
      if (!cb) {
        cb = opts
        opts = null
      }

      var cbId = callbackId
      callbackId += 1
      callbackMap[cbId] = cb

      try {
        platform.send(pluginId,
          fnName,
          opts,
          cbId,
          function (err) {
            cb(err)
            delete callbackMap[cbId]
          })
      } catch (e) {
        cb(e)
      }
    } else {
      if (!pending[pluginId]) {
        pending[pluginId] = []
      }
      pending[pluginId].push(arguments)
    }
  } else {
    cb(unsupportedPlatformError)
  }
}

exports.ready = function (err, response, pluginId) {
  if (err) {
    // TODO Make sure the app is notified (emit an error?)
    console.error('`ready` fired with error', err)
  } else {
    if (pluginId) {
      ready[pluginId] = true
      if (pending[pluginId]) {
        var curr = pending[pluginId].shift()
        while (curr) {
          exports.send.apply(this, curr)
          curr = pending[pluginId].shift()
        }
      }
    }
  }
}

exports.result = function (cbId, err, response) {
  callbackMap[cbId](err, response)
  delete callbackMap[cbId]
}

exports.receive = function (err, message, pluginId) {
  // TODO
}

set(window, 'vigour.native.bridge.ready', exports.ready)
set(window, 'vigour.native.bridge.send', exports.send)
set(window, 'vigour.native.bridge.result', exports.result)
set(window, 'vigour.native.bridge.receive', exports.receive)
