'use strict'

var ios = module.exports = {}

ios.send = function iosSend (pluginId, fnName, opts, cbId, cb) {
  var message = {
    pluginId: pluginId,
    fnName: fnName,
    opts: opts,
    cbId: cbId
  }
  bridge.write(message)
}

ios.write = function iosWrite (msg) {
  try {
    window.webkit.messageHandlers.vigourBridgeHandler.postMessage(msg)
  } catch (err) {
    console.error('The native context does not exist yet')
    if (cb) {
      cb(err)
    }
  }
}

ios.emit = function iosEmit (event, data) {
  ios.wrte({
    event: event,
    data: data
  })
}