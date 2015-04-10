var bridge = require('../')

module.exports = exports = {}
/**
  wil send a message to the native side and returns immediately

  @param {Object} message - will be stringified
**/
exports.send = function (message) {
  NativeInterface.send(JSON.stringify(message))
}

/**
 * called by the android counterpart
**/
exports.receiveResult = function (id, result) {
  receiveNativeResult(id, result)
}
window.receiveAndroidResult = exports.receiveResult


exports.receiveError = function (id, error) {
  receiveNativeError(id, error)
}
window.receiveAndroidError = exports.receiveError