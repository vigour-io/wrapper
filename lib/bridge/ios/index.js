module.exports = exports = {}

exports.send = function (payload) {
  if (window.webkit
    && window.webkit.messageHandlers
    && window.webkit.messageHandlers.vigourBridgeHandler
    && window.webkit.messageHandlers.vigourBridgeHandler.postMessage) {
    setTimeout(function () {
      console.log("YES")
    }, 7000)
    window.webkit.messageHandlers.vigourBridgeHandler.postMessage(payload)
    setTimeout(function () {
      console.log("DONE")
    }, 7000)
  } else {
    setTimeout(function () {
      console.log("NO")
    }, 7000)
  }
}