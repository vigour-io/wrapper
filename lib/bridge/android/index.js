'use strict'

var platform = module.exports = exports = {}

platform.send = function send (pluginId, fnName, opts, cbId, cb) {
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

platform.write = function write (message, cb) {
  try {
    let str = JSON.stringify(message)
    window.NativeInterface.send(str)
  } catch (err) {
    console.error("window.NaiveInterface does not exist")
    if (cb) {
      cb(err)
    }
  }
}

