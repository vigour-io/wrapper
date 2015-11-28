'use strict'

var platform = module.exports = exports = {}

platform.send = function send (pluginId, fnName, opts, cbId, cb) {
  if (!pluginId) {
    pluginId = ''
  }
  if (!fnName) {
    fnName = ''
  }
  if(!opts) {
    opts = ''
  }
  if(!cbId) {
    cbId = 0
  }

  platform.write([cbId, pluginId, fnName, opts])
}

platform.write = function write (message, cb) {
  try {
    var str = JSON.stringify(message)
  } catch (e) {
    cb(e)
  }
  try {
    console.log('bridge.send ing to android', message)
    window.NativeInterface.send(str)
  } catch (e) {
    console.error("window.NaiveInterface does not exist")
    if (cb) {
      cb(err)
    }
  }
}

platform.emit = function emit (event, data) {
  platform.write([0, '', event, data])
}