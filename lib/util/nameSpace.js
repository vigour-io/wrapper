'use strict'

var VNAME = /vigour-(.+)|@vigour\/(.+)/

module.exports = function nameSpace (pkgName) {
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
