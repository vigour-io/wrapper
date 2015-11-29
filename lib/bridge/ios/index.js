'use strict'

var ios = exports

ios.send = function iosSend (pluginId, fnName, opts, cbId, cb) {
  var message = {
    pluginId: pluginId,
    fnName: fnName,
    opts: opts,
    cbId: cbId
  }
  ios.write(message, cb)
}

ios.write = function iosWrite (msg, cb) {
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
  ios.write({
    event: event,
    data: data
  })
}
