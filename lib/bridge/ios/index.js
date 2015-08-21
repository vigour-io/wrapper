var bridge = require('../')

module.exports = exports = bridge
/**
  wil send a message to the native side and returns immediately

  @param {Object} message
**/
exports.send = function (message) {
  try {
      webkit.messageHandlers.vigourBridgeHandler.postMessage(message);
  } catch(err) {
      console.log('The native context does not exist yet');
  }
}

