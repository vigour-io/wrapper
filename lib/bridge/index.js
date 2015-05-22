var Promise = require('promise')
  , env = require('../env')
  , messageId = 1
  , callbackMap = {}
  , error

module.exports = exports = {}

/**
  call a function in a native plugin
  @param {String} pluginId
  @param {String} fnName
  @param {Object} params
  @param {Function(err, value)} cb
 **/
exports.call = function (pluginId, fnName, params, cb) {
  var id = messageId++
  callbackMap[id] = cb
  exports.send([id, pluginId, fnName, params])
}
window.callNative = exports.call
if (!window.vigourNative) {
  window.vigourNative = {}
}
window.vigourNative.bridge = exports.call
exports.popCallback = function (id) {
  if (!callbackMap[id]) {
    exports.addToDom("illegal id: "+id) 
    return
  }
  var cb = callbackMap[id]
  delete callbackMap[id]
  return cb
}

exports.receiveNativeResult = function (id, result) {
  var cb = exports.popCallback(id)
  if (cb) {
    cb(null, result)
  } else {
    exports.addToDom("result without cb: " + error)
  }
}
window.receiveNativeResult = exports.receiveNativeResult

exports.receiveNativeError = function (id, error) {
  var cb = exports.popCallback(id)
  if (cb) {
    cb(error)
  } else {
    exports.addToDom("error without cb: " + error)
  }
}
window.receiveNativeError = exports.receiveNativeError

exports.addToDom = function (data) {
    var p = document.createElement('p')
    p.setAttribute('class', 'debug-output')
    p.appendChild(document.createTextNode(data))
    var container = document.getElementById('container');
    if (container.firstChild) {
        container.insertBefore(p, container.firstChild)
    } else {
        container.appendChild(p)
    }
}
window.addToDom = exports.addToDom

exports.receiveResult = function (id, result) {
  receiveNativeResult(id, result)
}

exports.receiveError = function (id, error) {
  receiveNativeError(id, error)
}

