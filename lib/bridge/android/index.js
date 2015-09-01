module.exports = exports = {}

exports.send = function (pluginId, fnName, opts, cbId, cb) {
  var message = {
    pluginId: pluginId,
    fnName: fnName,
    opts: opts,
    cbId: cbId
  }
  try {
    var str = JSON.stringify(message)
  } catch (e) {
    cb(e)
  }
  try {
    window.NativeInterface.send(str)
  } catch (e) {
    // TODO replace this is a queueing system
    console.error("window.NaiveInterface doesn't exist")
    cb(e)
  }
}
