/* global describe, it, expect */

// Let's pretend we're android for these platform-agnostic tests
var env = require('../../../lib/env.js')
env.platform = 'android'

var bridge
var pluginId = 1
var pluginFn = 'doSomething'
var pluginOptsOne = { key: 'valueOne' }
var pluginOptsTwo = { key: 'valueTwo' }
var pluginResult = { result: 'super nice' }

describe('bridge', function () {
  it('should be requireable', function () {
    bridge = require('../../../lib/bridge')
    expect(typeof bridge).equal('object')
  })

  it('should enqueue calls until plugin is ready, then call them in order', function (done) {
    // window.NativeInterface.send is usually provided by the android build script
    window.NativeInterface = {
      send: function (str) {
        var argsArray = JSON.parse(str)
        setTimeout(function () {
          window.vigour.native.bridge.result(argsArray[0], null, pluginResult)
        }, 200)
      }
    }
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
    }, 200)
  })
})
