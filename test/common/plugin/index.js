'use strict'

// we need to mock all behaviour for tests here
// also we need to use correct error handeling from the bridge
describe('Plugin', function () {
  var BridgeObservable = require('../../../lib/bridge/bridgeObservable')
  var Plugin = require('../../../lib/bridge/plugin')
  var example = new Plugin({
    key: 'example',
    display: {}
  })

  it('should have a BridgeObservable as a Child', function () {
    expect(example.display).instanceof(BridgeObservable)
  })
})
