'use strict'

var bridge = require('./')
var VNAME = /vigour-(.+)|@vigour\/(.+)/

module.exports = function (pkgName) {
  var pluginId = parseName(pkgName)
  return function (base) {
    bridge.plugins[pluginId] = base
    base.set({
      define: {
        send (methodName, params, cb) {
          bridge.send(pluginId, methodName, params, cb)
        }
      }
    })
  }
}

function parseName (pkgName) {
  var vigourName = pkgName && pkgName.match(VNAME)
  vigourName = vigourName
    ? vigourName[1]
    : pkgName

  if (vigourName) {
    return vigourName
  } else {
    throw Error('could not read package name!')
  }
}
