var bridge = require('../')

module.exports = exports = {}
/**
  wil send a message to the native side and returns immediately

  @param {Object} message
**/
exports.send = function (message) {
  NativeInterface.send(JSON.stringify(message))
}

/**
 * called by the android counterpart
 * expects a serialised array with [id,result,error]
**/
exports.receiveResult = function (id, result) {
  receiveNativeResult(id, result)
}
window.receiveAndroidResult = exports.receiveResult


exports.receiveError = function (id, error) {
  receiveNativeError(id, error)
}
window.receiveAndroidError = exports.receiveError