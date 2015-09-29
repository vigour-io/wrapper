var BridgeObservable = require('../../../lib/bridge/BridgeObservable')
var bridge = require('../../../lib/bridge')
var Plugin
var plugin

describe('Plugin', function () {
  sinon.spy(bridge, 'registerPlugin')
  it('should be requireable', function () {
    Plugin = require('../../../lib/bridge/Plugin')
    expect(typeof Plugin).to.equal('function')
  })

  it('should be instantiatable', function () {
    plugin = new Plugin({
      x: {}
    })
    expect(plugin).instanceOf(Plugin)
  })

  it('should register itself with the bridge on instantiation', function () {
    expect(bridge.registerPlugin).calledOnce
  })

  it('should have BridgeObservable children', function () {
    expect(plugin.x).instanceOf(BridgeObservable)
  })
})
