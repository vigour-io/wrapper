'use strict'

var log = require('npmlog')
var exe = require('../../exe')
module.exports = exports = function () {
  if (this.builds) {
    log.info('- start building plugincore -')
    return exe('./gradlew plugincore:uploadArchives', this.pluginCoreSrc)
      .then(function () {
        log.info('- building plugincore done -')
      })
  } else {
    log.info('- skipping building plugincore -')
  }
}
