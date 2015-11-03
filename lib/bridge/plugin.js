'use strict'

var bridge = require('./')
var Observable = require('vigour-js/lib/observable')
var BridgeObservable = require('./bridgeobservable')

var Plugin = new Observable({
  inject: [
    require('vigour-js/lib/methods/plain'),
    require('vigour-js/lib/methods/setWithPath')
  ],
  on: {
    new: {
      bridge () {
        bridge.registerPlugin(this)
      }
    },
    bridge: {
      condition (data, next, event) {
        bridge.send(this.key, 'set', this.plain(), (err) => {
          if (err) {
            this.emit('error', err)
          } else {
            next()
          }
        })
      }
    }
  },
  ChildConstructor: BridgeObservable
}).Constructor

module.exports = Plugin
