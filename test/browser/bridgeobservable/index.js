'use strict'

var Observable = require('vigour-js/lib/observable')

describe('BridgeObservable', function () {
  var BridgeObservable
  var bridgeObservable

  it('should be requireable', function () {
    // these tests are unsecceray
    BridgeObservable = require('../../../lib/bridge/bridgeobservable')
    expect(typeof BridgeObservable).to.equal('function')
  })

  it('should be instantiatable', function () {
    // these tests are unsecceray
    bridgeObservable = new BridgeObservable({
      x: {}
    })
    expect(bridgeObservable).instanceOf(Observable)
  })

  it('should have BridgeObservable children', function () {
    expect(bridgeObservable.x).instanceOf(BridgeObservable)
  })

  it('should emit `bridge` events on change', function (done) {
    bridgeObservable.once('bridge', function (data) {
      expect(data).equals(bridgeObservable.x)
      done()
    })
    bridgeObservable.x.val = 'value'
  })
})
