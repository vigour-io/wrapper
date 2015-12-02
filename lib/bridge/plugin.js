'use strict'

var bridge = require('./')
var Observable = require('vigour-js/lib/observable')
var plain = require('vigour-js/lib/methods/plain')

var Plugin = new Observable({
  ready: false,
  properties: {
    bridge: { val: bridge }
  },
  id: {
    on: {
      value (val) {
        console.log('haha plugin id is', value)
      }
    }
  },
  inject: [
    require('vigour-js/lib/methods/plain'),
    require('vigour-js/lib/methods/setWithPath')
  ],
  on: {
    ready: {
      bridge () {
        this.ready.val = true
      }
    }
  },
  define: {
    key:{
      set (val) {
        this._key = val
        bridge.registerPlugin(this)
      },
      get () {
        return this._key
      }
    },
    send(methodName, params, callback) {
      this.bridge.send(this.key, methodName, params, callback)
    }
  }
}).Constructor

module.exports = Plugin

var plugin = new Plugin({id: 'hehehe'})

console.log('plugin has id', plugin.id.val)