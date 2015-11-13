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
    setTimeout(() => {
      expect(spy.calledOnce).to.be.true
      done()
    }, 1000)
  })

  describe('ChromeCast Sender', function () {
    it('should receive \'join\' events for every device avalable', function () {
      console.log(plugin.devices)
    })

    it('should receive \'left\' events for every device avalable', function () {
    })
  })
})
