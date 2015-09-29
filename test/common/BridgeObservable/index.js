var Observable = require('vjs/lib/observable')
var BridgeObservable
var bridgeObservable

describe('BridgeObservable', function () {
  it('should be requireable', function () {
    BridgeObservable = require('../../../lib/bridge/BridgeObservable')
    expect(typeof BridgeObservable).to.equal('function')
  })

  it('should be instantiatable', function () {
    bridgeObservable = new BridgeObservable({
      x: {}
    })
    expect(bridgeObservable).instanceOf(Observable)
  })

  it('should have BridgeObservable children', function () {
    expect(bridgeObservable.x).instanceOf(BridgeObservable)
  })

  it('should emit `bridge` events on change', function () {
    var spy = sinon.spy()
    bridgeObservable.on('bridge', spy)
    bridgeObservable.x.val = { key: 'value' }
    expect(spy).calledOnce
  })
})
