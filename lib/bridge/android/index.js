'use strict'

module.exports = exports = {}

exports.send = function (pluginId, fnName, opts, cbId, cb) {
  var message = [cbId, pluginId, fnName, opts]
  try {
    var str = JSON.stringify(message)
  } catch (e) {
    cb(e)
  }
  try {
    console.log('bridge.send ing to android')
    window.NativeInterface.send(str)
  } catch (e) {
    // TODO replace this is a queueing system
    console.error("window.NaiveInterface doesn't exist")
    cb(e)
  }
}
