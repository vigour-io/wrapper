'use strict'

module.exports = exports = {}

exports.send = function (pluginId, fnName, opts, cbId, cb) {
  var message = {
    pluginId: pluginId,
    fnName: fnName,
    opts: opts,
    cbId: cbId
  }
  try {
    window.webkit.messageHandlers.vigourBridgeHandler.postMessage(message)
  } catch (err) {
    console.error('The native context does not exist yet')
    cb(err)
  }
}
