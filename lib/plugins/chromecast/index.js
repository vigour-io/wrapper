'use strict'
var Plugin = require('../../../lib/bridge/plugin')
var Observable = require('vigour-js/lib/observable')

var Devices = new Observable({
  define: {
    join (deviceId, name) {
      // TODO device should be an observable too
      if (!this.devices) this.devices = {}
      this.devices[deviceId] = {
        id: deviceId,
        name: name
      }
    },
    leave (deviceId) {
      delete this.devices[deviceId]
    },
    list () {
      return this.devices
    }
  }
}).Constructor

var ChromeCast = new Plugin({
  key: 'ChromeCast',
  receiver: {
    on: {
      data: {
        receiver () {
          console.log('-- receiver')
          console.log('this', this)
          var plugin = this.parent
          console.log('parent', plugin)
          this.bridge.send('ChromeCast', 'init')
        }
      }
    }
  },
  on: {
    data (data) {
      console.log('data', this)
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
          this.devices.join(data.id, data.name)
        case 'left':
          this.devices.leave(data.id)
        default:
          this.emit('error', 'Event [' + type + '] is not implemented')
      }
    }
  },
  define: {
    scanForDevices () {
      this.bridge.send('scanForDevices')
    }
  }
}).Constructor

module.exports = ChromeCast

// sender
var sender = new ChromeCast({
  key: 'ChromeCastSender',
  bridge: {
    useVal: require('../../../dev/bridgemock')
  }
})
var receiver = new ChromeCast({
  key: 'ChromeCastReceiver',
  bridge: {
    useVal: require('../../../dev/bridgemock')
  }
})

sender.val = 'my_crazy_app_id'

receiver.receiver.val = true
