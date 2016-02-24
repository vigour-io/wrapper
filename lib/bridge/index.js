'use strict'

var Observable = require('vigour-observable')
var Event = require('vigour-event')
var set = require('lodash/object/set')
var env = require('../env')

var nameSpace = require('../util/nameSpace')

var bridge = module.exports = exports = new Observable({
  properties: {
    plugins: { val: {} },
    readies: { val: {} },
    nativeReadies: { val: {} }
  },
  define: {
    send (pluginId, fnName, opts, cb) {
      // console.log('\n\n>>>>>>>>>>>>>>> bridge.send')
      // console.log('pluginId', pluginId)
      // console.log('fnName', fnName)
      // console.log('opts', opts)
      // console.log('\n\n')
      if (!cb) {
        cb = opts
        opts = null
      }
      if (bridge.platform) {
        // console.log('platform found')
        let plugin = bridge.readies[pluginId]
        if (plugin) {
          // console.log('plugin ready')
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
            // console.log('bridge.platform.sent!')
          } catch (e) {
            console.error('`send` called failed', e)
            cb(e)
          }
        } else {
          // console.warn('plugin not ready')
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
      // console.log('\n\n<<<<<<<<<<<<<<< bridge.ready', arguments)
      if (pluginId) {
        pluginId = nameSpace(pluginId)
        // console.log('pluginId', pluginId)
        // console.log('err', err)
        // console.log('response', response)
        // console.log('pluginId', pluginId)
        // console.log('\n\n')
        let bridgePlugin = bridge.plugins[pluginId]
        bridge.nativeReadies[pluginId] = true
        if (bridgePlugin) {
          if (err) {
            bridgePlugin.emit('error', err)
          } else {
            // console.log('--- set platform ready!', pluginId, bridgePlugin)
            if (!bridgePlugin.parent) {
              throw Error('bridgePlugin ' + pluginId + ' has no parent!')
            }
            if (!bridgePlugin.parent.ready) {
              throw Error('bridgePlugin.parent' + pluginId + ' has no ready!')
            }
            bridgePlugin.parent.ready.val = true
            bridge.readies[pluginId] = bridgePlugin
            let pendingSends = pending[pluginId]
            if (pendingSends) {
              let tosend
              while ((tosend = pendingSends.shift())) {
                this.send.apply(this, tosend)
              }
            }
          }
        } else {
          // this will always happen the first time now...
          // console.error('could not find that plugin', pluginId)
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
        // console.log('could not parse', response)
      }
      // console.log('\n\n<<<<<<<<<<<<<<< bridge.result')
      // console.log('cbId', cbId)
      // console.log('err', err)
      // console.log('response', response)
      // console.log('\n\n')

      var caller = callbackMap[cbId]
      if (!caller) {
        let errorMessage = 'could not find callback ' + cbId
        console.error(errorMessage)
        bridge.emit('error', new Error(errorMessage))
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
      // console.log('\n\n<<<<<<<<<<<<<<< bridge.receive')
      // console.log('eventType', eventType)
      // console.log('data', data)
      if (pluginId) {
        pluginId = nameSpace(pluginId)
        // console.log('pluginId', pluginId)
        // console.log('\n\n')
        var plugin = bridge.plugins[pluginId]
        if (!plugin) {
          let errorMessage = 'could not emit on Plugin: ' + pluginId
          console.log(errorMessage)
          bridge.emit('error', new Error(errorMessage))
        } else {
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data)
            } catch (err) {
              // console.log('data string cannot be `JSON.parse`d', err)
            }
          }
          var ev = new Event('data')
          ev.stamp = 'bridge'
          plugin.emit(eventType, data, ev)
        }
      } else {
        // console.log('no pluginId!', pluginId)
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

var pending = {}

if (typeof window !== 'undefined') {
  set(window, 'vigour.native.bridge', bridge)
}

bridge.platform.emit('bridgeReady')
