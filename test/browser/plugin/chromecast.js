'use strict'
var ChromeCastPlugin = require('../../../lib/plugins/chromecast')
var devBridge = require('../../../dev/bridgemock')

describe('Testing ChromeCastPlugin', function () {
  var plugin
  var bridge = window.vigour.native.bridge

  it('should be able to create a plugin instance', function (done) {
    var spy = sinon.spy(bridge, 'ready')
    plugin = new ChromeCastPlugin({
      key: 'ChromeCast',
      bridge: {
        useVal: devBridge
      }
    })
    plugin.val = 'myAppId'
    // Wait for ready event plus fake devcies scan to run
    setTimeout(() => {
      expect(spy.calledOnce).to.be.true
      done()
    }, 500)
  })

  describe('ChromeCast Sender', function () {
    var testDevice = {
      id: 'testDeviceId',
      name: 'testDeviceName'
    }

    it('should add devices passed through the \'join\' event', function () {
      // emulate device join
      window.vigour.native.bridge.receive(null, {type: 'join', data: testDevice}, 'ChromeCast')
      expect(plugin.devices[testDevice.id]).to.exists
    })

    it('should remove devices passed through the \'leave\' event', function () {
      // emulate device leave
      window.vigour.native.bridge.receive(null, {type: 'leave', data: testDevice}, 'ChromeCast')
      expect(plugin.devices[testDevice.id]).to.not.exists
    })

    it('should be able to start casting for a device', function (done) {
      // fake device join
      window.vigour.native.bridge.receive(null, {type: 'join', data: testDevice}, 'ChromeCast')
      // call startCasting for testDevice
      var device = plugin.devices[testDevice.id]
      plugin.startCasting(device)
      expect(plugin.session.val).to.equal(device)
      // session.val === device >> "connecting OR connected" to device
      expect(plugin.session).to.not.have.property('id')
      // state is now "connecting" because no session.id yet

      // wait for 'connected' event
      setTimeout(() => {
        // expect 'connected' event to have fired 1 time
        expect(plugin.session.id.val).to.exist
        // state is now "connected" because I have a session id
        done()
      }, 200)
    })

    it('should be able to stop casting for a device', function (done) {
      // device already joined
      // call stopCasting for testDevice
      plugin.stopCasting()
      // session should be false
      // wait for 'disconnected' event
      setTimeout(() => {
        expect(plugin.session).to.be.false
        done()
      }, 200)
    })
  })
})
