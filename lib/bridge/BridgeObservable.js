var Observable = require('vjs/lib/observable')

var BridgeObservable = new Observable({
  on: {
    data: {
      bridge: function (payload, event) {
        this.getRoot().emit('bridge', this, event)
      }
    }
  },
  ChildConstructor: 'Constructor'
}).Constructor

module.exports = exports = BridgeObservable
