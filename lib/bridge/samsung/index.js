'use strict'

var samsung = exports
/**
  Will send a message to the native side and returns immediately

  @param {Object} message
**/
samsung.send = function (message) {
  throw Error('Not implemented')
}

samsung.write = function iosWrite (msg, cb) {
  throw Error('Not implemented')
}

samsung.emit = function iosEmit (event, data) {
  throw Error('Not implemented')
}
