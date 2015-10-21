var Observable = require('vjs/lib/observable')
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
    exports.platform = false
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

var plugins = {}

exports.registerPlugin = function (plugin) {
  plugins[plugin.key] = plugin
}

exports.send = send

function send (pluginId, fnName, opts, cb) {
  console.log('`send` called', pluginId, fnName, opts)
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
        console.log('`send` called succeeded')
      } catch (e) {
        console.error('`send` called failed', e)
        cb(e)
      }
    } else {
      console.log('`send` plugin not ready')
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
  console.log('`ready` event', pluginId)
  if (err) {
    // TODO Make sure the app is notified (emit an error?)
    console.error('`ready` fired with error', err)
  } else {
    if (pluginId) {
      if (plugins[pluginId]) {
        plugins[pluginId].emit('ready', response, void 0)
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
    if (plugins[pluginId]) {
      plugins[pluginId].emit('error', err, void 0)
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
  if (err) {
    console.error('receive error', err)
  } else {
    if (pluginId) {
      plugins[pluginId].emit('receive', message, void 0)
    } else {
      exports.emit('receive', message, void 0)
    }
  }
}

set(window, 'vigour.native.bridge.error', error)
set(window, 'vigour.native.bridge.ready', ready)
set(window, 'vigour.native.bridge.result', result)
set(window, 'vigour.native.bridge.receive', receive)
