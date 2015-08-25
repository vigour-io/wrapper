var set = require('lodash/object/set')
var env = require('../env')

var platform
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

module.exports = exports = {}

exports.send = function (pluginId, fnName, opts, cb) {
  if (platform) {
    var cbId = callbackId
    callbackId += 1 // TODO Prevent reaching max int
    callbackMap[cbId] = cb
    platform.send(pluginId,
      fnName,
      opts,
      cbId,
      function (err) {
        cb(err)
        delete callbackMap[cbId]
      })
  } else {
    cb(unsupportedPlatformError)
  }
}

exports.receive = function (cbId, err, response) {
  callbackMap[cbId](err, response)
  delete callbackMap[cbId]
}

set(window, 'vigour.native.bridgeResult', exports.receive)
