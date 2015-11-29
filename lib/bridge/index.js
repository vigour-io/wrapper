'use strict'

var Observable = require('vigour-js/lib/observable')
var set = require('lodash/object/set')
var env = require('../env')

var bridge = module.exports = exports = new Observable({
  properties: {
    plugins: {val: {}}
  },
  define: {
    send (pluginId, fnName, opts, cb) {
      if (!cb) {
        cb = opts
        opts = null
      }
      if (bridge.platform) {
        console.log('platform found')
        if (readies[pluginId]) {
          console.log('plugin ready')
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
            console.log('bridge.platform.sent!')
          } catch (e) {
            console.error('`send` called failed', e)
            cb(e)
          }
        } else {
          console.warn('plugin not ready')
          if (!pending[pluginId]) {
            pending[pluginId] = []
          }
          pending[pluginId].push(arguments)
        }
      } else {
        console.error('`send` platform not available')
        cb(unsupportedPlatformError)
      }
    },
    ready (err, response, pluginId) {
      console.log('bridge.ready!', arguments)
      if (err) {
        // TODO Make sure the app is notified (emit an error?)
        console.error('`ready` fired with error', err)
      } else {
        if (pluginId) {
          if (bridge.plugins[pluginId]) {
            bridge.plugins[pluginId].emit('ready', response, void 0)
          } else {
            console.error('could not find that plugin', pluginId)
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
    result (cbId, err, response) {
      try {
        response = JSON.parse(response)
      } catch (unimportantErr) {
        console.log('could not parse', response)
      }
      console.log('result: {')
      console.log('cbId:', cbId)
      console.log('err:', err)
      console.log('response:', response)
      console.log('}')
      try {
        callbackMap[cbId](err, response)
        delete callbackMap[cbId]
      } catch (e) {
        console.error('could not find callback', e)
      }
    },
    receive (eventType, data, pluginId) {
      console.log('receive: {')
      console.log('eventType:', eventType)
      console.log('data:', data)
      console.log('pluginId:', pluginId)
      console.log('}')
      if (pluginId) {
        var plugin = bridge.plugins[pluginId]
        if (!plugin) {
          throw new Error('could not emit on Plugin: ' + pluginId)
        }
        plugin.emit(eventType, data)
      } else {
        bridge.emit(eventType, data)
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
