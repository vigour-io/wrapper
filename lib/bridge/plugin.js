'use strict'

var bridge = require('./')
var Observable = require('vigour-js/lib/observable')
var plain = require('vigour-js/lib/methods/plain')
Observable.prototype.inject(plain)

window.bridge = bridge

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
    new: {
      bridge() {
        bridge.registerPlugin(this)
      }
    }
  },
  define: {
    send(methodName, params, callback) {
      this.bridge.send(this.key, methodName, params, callback)
    }
  }
}).Constructor

module.exports = Plugin
