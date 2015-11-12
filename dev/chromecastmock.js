'use strict'
var Plugin = require('../lib/bridge/plugin')
var devBridge = require('./bridgemock')

var ChromeCast = new Plugin({
  key: 'ChromeCast',
  on: {
    new: {
      ChromeCastPlugin () {
        this.bridge.send('ChromeCast', 'init')
      }
    },
    receive (msg) {
      console.log('wut got a msg!', msg)
      if(msg.joined){
        this.bridge.send('ChromeCast', 'joined received')
      } else if(msg.left) {
        this.bridge.send('ChromeCast', 'left received')
      }
    }
  },
  define: {
    scanForDevices () {
      this.bridge.send('scanForDevices')
    },
  },
  bridge: {
    useVal: devBridge
  }
}).Constructor

module.exports = ChromeCast
