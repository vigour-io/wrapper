'use strict'
var Observable = require('vjs/lib/observable')

// we need to mock all behaviour for tests here
// also we need to use correct error handeling from the bridge
describe('Plugin', function () {
  var BridgeObservable = require('../../../lib/bridge/BridgeObservable')
  var Plugin = require('../../../lib/bridge/Plugin')
  var example = new Plugin({
    key: 'example',
    display: {}
  })

  it('should have a BridgeObservable as a Child', function () {
    expect(example.display).instanceof(BridgeObservable)
  })

  it('should fire conditions for new plugins', function (done) {
    example.on('error', function () {
      done()
    })
    example.display.val = 'geinig'
  })
})
