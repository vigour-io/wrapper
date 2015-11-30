'use strict'

var bridge = require('./')
var Observable = require('vigour-js/lib/observable')

var Plugin = new Observable({
  ready: false,
  properties: {
    bridge: { val: bridge }
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
    key: {
      set (val) {
        this._key = val
        bridge.registerPlugin(this)
      },
      get () {
        return this._key
      }
    },
    send (methodName, params, callback) {
      this.bridge.send(this.key, methodName, params, callback)
    }
  }
}).Constructor

module.exports = Plugin
