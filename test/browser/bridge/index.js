'use strict'

var bridge
var pluginId = 1
var pluginFn = 'doSomething'
var pluginOptsOne = { key: 'valueOne' }
var pluginOptsTwo = { key: 'valueTwo' }
var pluginResult = require('../../helpers/success.json')
var customPlatform = require('../../helpers/customplatform')

describe('bridge', function () {
  it('should be requireable', function () {
    bridge = require('../../../lib/bridge')
    expect(typeof bridge).equal('object')
  })

  describe('native events', function () {
    before(function () {
      bridge.platform = customPlatform
    })
    it('should emit the `ready` event', function () {
      var spy = sinon.spy()
      bridge.once('ready', spy)
      window.vigour.native.bridge.ready(null, 'message')
      expect(spy).calledOnce
    })

    it('should emit `error` events', function () {
      var spy = sinon.spy()
      bridge.once('error', spy)
      window.vigour.native.bridge.error('message')
      expect(spy).called
    })
  })

  it('should enqueue calls until plugin is ready, then call them in order', function (done) {
    var oneDone = false
    var twoDone = false

    bridge.send(pluginId, pluginFn, pluginOptsOne, function (err, data) {
      expect(err).not.to.exist
      expect(data).to.deep.equal(pluginResult)
      oneDone = true
      expect(twoDone).to.equal(false)
    })

    bridge.send(pluginId, pluginFn, pluginOptsTwo, function (err, data) {
      expect(err).not.to.exist
      expect(data).to.deep.equal(pluginResult)
      expect(oneDone).to.equal(true)
      twoDone = true
      if (oneDone && twoDone) {
        done()
      }
    })
    setTimeout(function () {
      // This is usually called by the native side
      window.vigour.native.bridge.ready(null, {}, pluginId)
    }, 100)
  })
})
