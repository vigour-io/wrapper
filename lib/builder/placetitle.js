'use strict'

var path = require('path')

module.exports = exports = function () {
  var htmlTasks = []
  var htmlLocations = this.locateAsset(this.html)
  if (htmlLocations.assets) {
    htmlTasks.push(path.join(this.wwwDst, this.html))
  }
  if (htmlLocations.externalAssets) {
    htmlTasks.push(path.join(this.externalAssetsDir, this.html))
  }
  if (htmlTasks.length === 0) {
    var error = new Error('Invalid configuration')
    error.info = "Can't find app index (" + this.html + ') to change title'
    error.todo = 'Make sure `appIndexPath` is set to a file that appears in either `assets` or `externalAssets`'
    throw error
  }

  return htmlTasks.reduce((prev, curr, index, arr) => {
    return prev.then(() => {
      return this.editFile(curr, (contents) => {
        return contents.replace('{{title}}', this.productName ? this.productName : 'title')
      })
    })
  }, Promise.resolve())
}
