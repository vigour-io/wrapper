var Observable = require('vjs/lib/observable')
var set = require('lodash/object/set')
var env = require('../env')

var platform
// TODO Eliminate code for other platforms during build process
switch (env.platform) {
  case 'ios':
    platform = require('./ios')
    break
  case 'android':
    platform = require('./android')
    break
  default:
    platform = false
    break
}
var unsupportedPlatformError = new Error('Unsupported platform')
unsupportedPlatformError.info = {
  platform: env.platform
}

var callbackMap = {}
var callbackId = 0

var readies = {}
var pending = {}

var plugins = {}

module.exports = exports = new Observable({

})

exports.registerPlugin = function (plugin) {
  plugins[plugin.key] = plugin
}

exports.send = send

function send (pluginId, fnName, opts, cb) {
  if (!cb) {
    cb = opts
    opts = null
  }
  if (platform) {
    if (readies[pluginId]) {
      var cbId = callbackId
      callbackId += 1
      callbackMap[cbId] = cb

      try {
        platform.send(pluginId,
          fnName,
          opts,
          cbId,
          function (err) {
            cb(err)
            delete callbackMap[cbId]
          })
      } catch (e) {
        cb(e)
      }
    } else {
      if (!pending[pluginId]) {
        pending[pluginId] = []
      }
      pending[pluginId].push(arguments)
    }
  } else {
    cb(unsupportedPlatformError)
  }
}

function ready (err, response, pluginId) {
  if (err) {
    // TODO Make sure the app is notified (emit an error?)
    console.error('`ready` fired with error', err)
  } else {
    if (pluginId) {
      if (plugins[pluginId]) {
        // plugins[pluginId].trigger('ready', response)
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
      // exports.trigger('ready', response)
    }
  }
}

function error (err, pluginId) {
  if (pluginId) {
    if (plugins[pluginId]) {
      // plugins[pluginId].trigger('error', err)
    } else {
      console.error('Error for unregistered plugin ' + pluginId, err)
    }
  } else {
    // exports.trigger('error', err)
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
  if (err) {
    console.error('receive error', err)
  } else {
    if (pluginId) {
      // plugins[pluginId].trigger('receive', message)
    } else {
      // exports.trigger('receive', message)
    }
  }
}

set(window, 'vigour.native.bridge.error', error)
set(window, 'vigour.native.bridge.ready', ready)
set(window, 'vigour.native.bridge.result', result)
set(window, 'vigour.native.bridge.receive', receive)
