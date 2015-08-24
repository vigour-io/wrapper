var bridge = require('../')

module.exports = exports = bridge
/**
  Will send a message to the native side and returns immediately

  @param {Object} message
**/
exports.send = function (message) {
  try {
    window.webkit.messageHandlers.vigourBridgeHandler.postMessage(message)
  } catch(err) {
    console.log('The native context does not exist yet')
  }
}
