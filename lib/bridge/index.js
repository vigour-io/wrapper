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
      console.log('\n\n=================')
      console.log('bridge.send')
      console.log('pluginId', pluginId)
      console.log('fnName', fnName)
      console.log('opts', opts)
      console.log('\n\n')
      if (!cb) {
        cb = opts
        opts = null
      }
      if (bridge.platform) {
        console.log('platform found')
        let plugin = readies[pluginId]
        if (plugin) {
          console.log('plugin ready')
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
      if (pluginId) {
        pluginId = nameSpace(pluginId)
        console.log('\n\n=================')
        console.log('bridge.ready')
        console.log('err', err)
        console.log('response', response)
        console.log('pluginId', pluginId)
        console.log('\n\n')
        let bridgePlugin = bridge.plugins[pluginId]
        if (bridgePlugin) {
          if (err) {
            bridgePlugin.emit('error', err)
          } else {
            console.log('--- set platform ready!', bridgePlugin)
            bridgePlugin.ready.val = response || true
            readies[pluginId] = true
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
        console.log('could not parse', response)
      }
      console.log('\n\n=================')
      console.log('bridge.result')
      console.log('cbId', cbId)
      console.log('err', err)
      console.log('response', response)
      console.log('\n\n')

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
      console.log('\n\n=================')
      console.log('bridge.receive')
      console.log('eventType', eventType)
      console.log('data', data)
      if (pluginId) {
        pluginId = nameSpace(pluginId)
        console.log('pluginId', pluginId)
        console.log('\n\n')
        var plugin = bridge.plugins[pluginId]
        if (!plugin) {
          throw new Error('could not emit on Plugin: ' + pluginId)
        }
        plugin.emit(eventType, data)
      } else {
        console.log('no pluginId!', pluginId)
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

if (typeof window !== 'undefined') {
  set(window, 'vigour.native.bridge', bridge)
}
