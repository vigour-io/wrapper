'use strict'

module.exports = exports = function (pth) {
  var pathParts = pth.split('/')
  var nbParts = pathParts.length
  var assetTracker = this.assets
  var externalAssetTracker = this.externalAssets
  for (let i = 0; i < nbParts; i += 1) {
    if (assetTracker) {
      assetTracker = assetTracker[pathParts[i]]
    }
    if (externalAssetTracker) {
      externalAssetTracker = externalAssetTracker[pathParts[i]]
    }
  }
  return {
    assets: assetTracker,
    externalAssets: externalAssetTracker
  }
}
