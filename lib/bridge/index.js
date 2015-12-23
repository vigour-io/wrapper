'use strict'

var Observable = require('vigour-js/lib/observable')
var set = require('lodash/object/set')
var env = require('../env')

var nameSpace = require('../util/nameSpace')

var bridge = module.exports = exports = new Observable({
  properties: {
    plugins: { val: {} }
  },
  define: {
    send (pluginId, fnName, opts, cb) {
      stepLog('\n\n=================')
      stepLog('bridge.send')
      stepLog('pluginId', pluginId)
      stepLog('fnName', fnName)
      stepLog('opts', opts)
      stepLog('\n\n')
      if (!cb) {
        cb = opts
        opts = null
      }
      if (bridge.platform) {
        stepLog('platform found')
        let plugin = readies[pluginId]
        if (plugin) {
          stepLog('plugin ready')
          var cbId = callbackId
          callbackId += 1
          callbackMap[cbId] = {
            plugin: plugin,
            cb: cb
          }
          try {
            bridge.platform.send(pluginId,
              fnName,
              opts,
              cbId,
              function (err) {
                cb(err)
                delete callbackMap[cbId]
              })
            stepLog('bridge.platform.sent!')
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
      stepLog('bridge.ready!', arguments)
      if (pluginId) {
        pluginId = nameSpace(pluginId)
        stepLog('\n\n=================')
        stepLog('bridge.ready')
        stepLog('err', err)
        stepLog('response', response)
        stepLog('pluginId', pluginId)
        stepLog('\n\n')
        let bridgePlugin = bridge.plugins[pluginId]
        if (bridgePlugin) {
          if (err) {
            bridgePlugin.emit('error', err)
          } else {
            stepLog('--- set platform ready!', bridgePlugin)
            bridgePlugin.ready.val = response || true
            readies[pluginId] = bridgePlugin
            let pendingSends = pending[pluginId]
            if (pendingSends) {
              let tosend
              while ((tosend = pendingSends.shift())) {
                this.send.apply(this, tosend)
              }
            }
          }
        } else {
          console.error('could not find that plugin', pluginId)
        }
      } else {
        if (err) {
          bridge.emit('error', err)
        } else {
          bridge.emit('ready', response)
        }
      }
    },
    result (cbId, err, response) {
      try {
        response = JSON.parse(response)
      } catch (unimportantErr) {
        stepLog('could not parse', response)
      }
      stepLog('\n\n=================')
      stepLog('bridge.result')
      stepLog('cbId', cbId)
      stepLog('err', err)
      stepLog('response', response)
      stepLog('\n\n')

      var caller = callbackMap[cbId]
      if (!caller) {
        throw Error('could not find callback ' + cbId)
      } else {
        if (err) {
          caller.plugin.emit('error', {err, response})
        }
        if (caller.cb) {
          caller.cb(err, response)
        }
        delete callbackMap[cbId]
      }
    },
    receive (eventType, data, pluginId) {
      stepLog('\n\n=================')
      stepLog('bridge.receive')
      stepLog('eventType', eventType)
      stepLog('data', data)
      if (pluginId) {
        pluginId = nameSpace(pluginId)
        stepLog('pluginId', pluginId)
        stepLog('\n\n')
        var plugin = bridge.plugins[pluginId]
        if (!plugin) {
          throw new Error('could not emit on Plugin: ' + pluginId)
        }
        plugin.emit(eventType, data)
      } else {
        stepLog('no pluginId!', pluginId)
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

var unsupportedPlatformError = new Error('Unsupported platform')
unsupportedPlatformError.info = {
  platform: env.ua.platform
}

var callbackMap = {}
var callbackId = 0

var readies = {}
var pending = {}

if (typeof window !== 'undefined') {
  set(window, 'vigour.native.bridge', bridge)
}

bridge.platform.emit('bridgeReady')

function stepLog () {
  for (var a = 0, al = arguments.length - 1; a <= al; a++) {
    console.log(arguments[a])
  }
}
