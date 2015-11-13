'use strict'
var Plugin = require('../../../lib/bridge/plugin')
var Observable = require('vigour-js/lib/observable')

var Devices = new Observable({
  define: {
    join (deviceId, name) {
      this.setKey(deviceId, {
          id: deviceId,
          name: name
        })
    },
    leave (deviceId) {
      this[deviceId].remove()
    }
  }
}).Constructor

var ChromeCast = new Plugin({
  key: 'ChromeCast',
  session: false,
  // receiver: {
  //   on: {
  //     data: {
  //       receiver () {
  //         console.log('-- receiver')
  //         console.log('this', this)
  //         var plugin = this.parent
  //         console.log('parent', plugin)
  //         this.bridge.send('ChromeCast', 'init')
  //       }
  //     }
  //   }
  // },
  on: {
    data (data) {
      if (!data.bridge) {
        this.devices = new Devices()
        this.bridge.send('ChromeCast', 'init', {appId: data})
      }
    },
    receive (event) {
      var plugin = this
      var type = event.type
      var data = event.data

      switch (type) {
        case 'join':
          plugin.devices.join(data.id, data.name)
          break
        case 'left':
          plugin.devices.leave(data.id)
          break;
        case 'connected':
          // session filled with reference to deviceID
          plugin.session = this.devices[data]
          break;
        case 'disconnected':
          // session as false
          plugin.session = false
          break;
        default:
          plugin.emit('error', 'Event [' + type + '] is not implemented')
          break;
      }
    }
  },
  define: {
    stopCasting () {
      // call disconnect on bridge
      this.bridge.send('ChromeCast', 'disconnect')
    },
    startCasting (deviceId) {
      // call connect on bridge with deviceId
      this.bridge.send('ChromeCast', 'connect', deviceId.val)
    }
  }
}).Constructor

module.exports = ChromeCast

// sender
// var sender = new ChromeCast({
//   key: 'ChromeCast',
//   bridge: {
//     useVal: require('../../../dev/bridgemock')
//   }
// })
//
// sender.val = 'my_crazy_app_id'

// var receiver = new ChromeCast({
//   key: 'ChromeCastReceiver',
//   bridge: {
//     useVal: require('../../../dev/bridgemock')
//   }
// })
// receiver.receiver.val = true
