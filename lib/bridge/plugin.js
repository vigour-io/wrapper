'use strict'

var bridge = require('./')
var Observable = require('vjs/lib/observable')
var BridgeObservable = require('./bridgeobservable')

var Plugin = new Observable({
  inject: [
    require('vjs/lib/methods/plain'),
    require('vjs/lib/methods/setWithPath')
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
