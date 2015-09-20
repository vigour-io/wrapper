var Observable = require('vjs/lib/observable')
var BridgeObservable = require('./BridgeObservable')
var bridge = require('./')

var Plugin = new Observable({
  on: {
    bridge: {
      condition: function (next, event, condition, meta) {
        bridge.send(this.key, 'set', this.convert({ raw: true }), function (err) {
          if (err) {
            condition.cancel(err)
          } else {
            next()
          }
        })
      }
    }
  },
  ChildConstructor: BridgeObservable
}).Constructor

module.exports = exports = Plugin
