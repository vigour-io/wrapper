var log = require('npmlog')
var exe = require('../../exe')
module.exports = exports = function () {
  log.info('- start building plugincore -')
  return exe('./gradlew plugincore:uploadArchives', this.pluginCoreSrc)
    .then(function () {
      log.info('- building plugincore done -')
    })
}
