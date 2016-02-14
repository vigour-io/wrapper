'use strict'

var locateAsset = require('../../../lib/builder/locateasset')

var mockBuilder = {
  assets: {
    root: {
      deeper: {
        a: true,
        c: true
      }
    }
  },
  externalAssets: {
    root: {
      deeper: {
        b: true,
        c: true
      }
    }
  }
}

describe('locateAsset', function () {
  it('should return an object with a truthy `assets` property if asset is in `assets`', function () {
    expect(locateAsset.call(mockBuilder, 'root/deeper/a').assets).to.be.ok
    expect(locateAsset.call(mockBuilder, 'root/deeper/a').externalAssets).to.be.not.ok
  })
  it('should return an object with a truthy `externalAssets` property if asset is in `externalAssets`', function () {
    expect(locateAsset.call(mockBuilder, 'root/deeper/b').assets).to.be.not.ok
    expect(locateAsset.call(mockBuilder, 'root/deeper/b').externalAssets).to.be.ok
  })
  it('should return an object with truthy `assets` and `externalAssets` properties if asset is in both', function () {
    expect(locateAsset.call(mockBuilder, 'root/deeper/c').assets).to.be.ok
    expect(locateAsset.call(mockBuilder, 'root/deeper/c').externalAssets).to.be.ok
  })
  it('should return an object with falsey `assets` and `externalAssets` properties if asset is in neither', function () {
    expect(locateAsset.call(mockBuilder, 'root/deeper/d').assets).to.be.not.ok
    expect(locateAsset.call(mockBuilder, 'root/deeper/d').externalAssets).to.be.not.ok
  })
})
