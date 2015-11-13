'use strict'

var Observable = require('vigour-js/lib/observable')
var set = require('lodash/object/set')
var env = require('../env')

module.exports = exports = new Observable({

})

exports.platform = false

// TODO Eliminate code for other platforms during build process
switch (env.ua.platform) {
  case 'ios':
    exports.platform = require('./ios')
    break
  case 'android':
    exports.platform = require('./android')
    break
  default:
    exports.platform = require('./stub')
    break
}
var unsupportedPlatformError = new Error('Unsupported platform')
unsupportedPlatformError.info = {
  platform: env.ua.platform
}

var callbackMap = {}
var callbackId = 0

var readies = {}
var pending = {}

exports.plugins = {}

exports.registerPlugin = function (plugin) {
  exports.plugins[plugin.key] = plugin
}

exports.send = send

function send (pluginId, fnName, opts, cb) {
  if (!cb) {
    cb = opts
    opts = null
  }
  if (exports.platform) {
    if (readies[pluginId]) {
      var cbId = callbackId
      callbackId += 1
      callbackMap[cbId] = cb

      try {
        exports.platform.send(pluginId,
          fnName,
          opts,
          cbId,
          function (err) {
            cb(err)
            delete callbackMap[cbId]
          })
      } catch (e) {
        console.error('`send` called failed', e)
        cb(e)
      }
    } else {
      if (!pending[pluginId]) {
        pending[pluginId] = []
      }
      pending[pluginId].push(arguments)
    }
  } else {
    console.error('`send` platform not available')
    cb(unsupportedPlatformError)
  }
}

function ready (err, response, pluginId) {
  console.log('ready called', err, response, pluginId)
  if (err) {
    // TODO Make sure the app is notified (emit an error?)
    console.error('`ready` fired with error', err)
  } else {
    if (pluginId) {
      if (exports.plugins[pluginId]) {
        exports.plugins[pluginId].emit('ready', response, void 0)
      }
      readies[pluginId] = true
      if (pending[pluginId]) {
        var curr = pending[pluginId].shift()
        while (curr) {
          send.apply(this, curr)
          curr = pending[pluginId].shift()
        }
      }
    } else {
      exports.emit('ready', response, void 0)
    }
  }
}

function error (err, pluginId) {
  if (pluginId) {
    if (exports.plugins[pluginId]) {
      exports.plugins[pluginId].emit('error', err, void 0)
    } else {
      console.error('Error for unregistered plugin ' + pluginId, err)
    }
  } else {
    exports.emit('error', err, void 0)
  }
}

function result (cbId, err, response) {
  try {
    callbackMap[cbId](err, response)
    delete callbackMap[cbId]
  } catch (e) {
    console.error('result', e)
  }
}

function receive (err, message, pluginId) {
  console.log('receive', message, pluginId)
  if (err) {
    console.error('receive error', err)
  } else {
    if (pluginId) {
      exports.plugins[pluginId].emit('receive', message, void 0)
    } else {
      if (message === 'resume' || message === 'pause') {
        exports.emit(message, void 0, void 0)
      } else {
        exports.emit('receive', message, void 0)
      }
    }
  }
}

set(window, 'vigour.native.bridge.error', error)
set(window, 'vigour.native.bridge.ready', ready)
set(window, 'vigour.native.bridge.result', result)
set(window, 'vigour.native.bridge.receive', receive)
