'use strict'

var fs = require('vigour-fs-promised')

module.exports = exports = function (pth, edit) {
  return fs.readFileAsync(pth, 'utf8')
    .then((contents) => {
      return edit(contents)
    })
    .then((newContents) => {
      return fs.writeFileAsync(pth, newContents, 'utf8')
    })
}
