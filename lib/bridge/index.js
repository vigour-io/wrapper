'use strict'

var Observable = require('vigour-js/lib/observable')
var set = require('lodash/object/set')
var env = require('../env')

var bridge = module.exports = exports = new Observable({
  properties: {
    plugins: {val: {}}
  },
  define: {
    registerPlugin (plugin) {
      bridge.plugins[plugin.key] = plugin
    },
    send (pluginId, fnName, opts, cb) {
      if (!cb) {
        cb = opts
        opts = null
      }
      if (bridge.platform) {
        if (readies[pluginId]) {
          var cbId = callbackId
          callbackId += 1
          callbackMap[cbId] = cb

          try {
            bridge.platform.send(pluginId,
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
          bridge.platform.send(pluginId, 'echo')
        }
      } else {
        console.error('`send` platform not available')
        cb(unsupportedPlatformError)
      }
    },
    ready (err, response, pluginId) {
      if (err) {
        // TODO Make sure the app is notified (emit an error?)
        console.error('`ready` fired with error', err)
      } else {
        if (pluginId) {
          if (bridge.plugins[pluginId]) {
            bridge.plugins[pluginId].emit('ready', response, void 0)
          }
          readies[pluginId] = true
          if (pending[pluginId]) {
            var curr = pending[pluginId].shift()
            while (curr) {
              this.send.apply(this, curr)
              curr = pending[pluginId].shift()
            }
          }
        } else {
          bridge.emit('ready', response, void 0)
        }
      }
    },
    error (err, pluginId) {
      if (pluginId) {
        if (bridge.plugins[pluginId]) {
          bridge.plugins[pluginId].emit('error', err, void 0)
        } else {
          console.error('Error for unregistered plugin ' + pluginId, err)
        }
      } else {
        bridge.emit('error', err, void 0)
      }
    },
    result (cbId, err, response) {
      console.log('result: {')
      console.log('cbId:', cbId)
      console.log('err:', err)
      console.log('response:', response)
      console.log('}')
      try {
        callbackMap[cbId](err, response)
        delete callbackMap[cbId]
      } catch (e) {
        console.error('result', e)
      }
    },
    receive (err, message, pluginId) {
      console.log('receive: {')
      console.log('err:', err)
      console.log('message:', message)
      console.log('pluginId:', pluginId)
      console.log('}')
      if (err) {
        console.error('receive error', err)
      } else {
        if (pluginId) {
          var eventType = message.type
          var data = message.data
          var plugin = bridge.plugins[pluginId]
          if (!plugin) {
            throw new Error('could not find Plugin: ' + pluginId)
          }
          plugin.emit(eventType, data)
        } else {
          if (message === 'resume' || message === 'pause') {
            bridge.emit(message, void 0, void 0)
          } else {
            bridge.emit('receive', message, void 0)
          }
        }
      }
    }
  }
})

bridge.platform = false

// TODO Eliminate code for other platforms during build process
switch (env.ua.platform) {
  case 'ios':
    bridge.platform = require('./ios')
    break
  case 'android':
    bridge.platform = require('./android')
    break
  default:
    bridge.platform = require('./stub')
    break
}

bridge.platform.emit('bridgeReady')

var unsupportedPlatformError = new Error('Unsupported platform')
unsupportedPlatformError.info = {
  platform: env.ua.platform
}

var callbackMap = {}
var callbackId = 0

var readies = {}
var pending = {}

set(window, 'vigour.native.bridge', bridge)
