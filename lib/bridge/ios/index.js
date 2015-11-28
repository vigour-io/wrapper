'use strict'

var platform = module.exports = {}

platform.send = function (pluginId, fnName, opts, cbId, cb) {
  var message = {
    pluginId: pluginId,
    fnName: fnName,
    opts: opts,
    cbId: cbId
  }
  platform.write(message, cb)
}

platform.write = function (message, cb) {
  try {
    window.webkit.messageHandlers.vigourBridgeHandler.postMessage(message)
  } catch (err) {
    console.error('The native context does not exist yet')
    cb(err)
  }
}