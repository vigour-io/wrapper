var payload = require('./success.json')

module.exports = exports = {
  send: function (pluginId, fnName, opts, cbId, cb) {
    window.vigour.native.bridge.result(cbId, null, payload)
  }
}
