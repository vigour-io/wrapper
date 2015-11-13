'use strict'
var ChromeCastPlugin = require('../../../lib/plugins/chromecast')
var devBridge = require('../../../dev/bridgemock')

describe('Testing ChromeCastPlugin', function () {
  var chromeCastPlugin
  var bridge = window.vigour.native.bridge
  it('should be able to create a plugin instance', function () {
    var spy = sinon.spy(bridge, 'ready')
    chromeCastPlugin = new ChromeCastPlugin({
      bridge: {
        useVal: devBridge
      }
    })
    expect(spy.calledOnce).to.be.true
  })

  it('should be able to receive join events', function () {
    var spy = sinon.spy(bridge, 'chromeCastPlugin')
    bridge.receive(null, {type: 'join', data: {id: 'friendlyName'}}, 'ChromeCast')
  })
})
