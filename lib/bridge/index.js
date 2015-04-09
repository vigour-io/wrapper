var Promise = require('promise')
  , ua = require('vigour-js/browser/ua')
  , bridges = {
    android: require('./android')
    , ios: require('./ios')  
  }
  , messageId = 1
  , callbackMap = {}
  , error

module.exports = exports = {}

console.log('platform', ua.platform)

if (bridges[ua.platform]) {
  exports.send = bridges[ua.platform].send
  exports.receiveResult = bridges[ua.platform].receiveResult
  exports.receiveError = bridges[ua.platform].receiveError
} else {
  error = new Error("Unsupported platform")
  error.requestedPlatform = ua.platform
  error.availablePlatofrms = Object.keys(bridges).join(',')
  console.error(error)
}

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

exports.receiveNativeError = function (id, error) {
  var cb = exports.popCallback(id)
  if (cb) {
    cb(error)
  } else {
    exports.addToDom("error without cb: " + error)
  }
}

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


