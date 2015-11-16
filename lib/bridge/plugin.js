'use strict'

var bridge = require('./')
var Observable = require('vigour-js/lib/observable')

var Plugin = new Observable({
  bridge: {
    useVal: bridge
  },
  inject: [
    require('vigour-js/lib/methods/plain'),
    require('vigour-js/lib/methods/setWithPath')
  ],
  on: {
    new: {
      bridge () {
        bridge.registerPlugin(this)
      }
    }
  },
  define: {
    send (methodName, params, callback) {
      console.log('sending', this.key.val, methodName, params, callback)
      this.bridge.send(this.key.val, methodName, params, callback)
    }
  }
}).Constructor

module.exports = Plugin
