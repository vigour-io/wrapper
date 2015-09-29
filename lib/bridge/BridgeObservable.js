var Observable = require('vjs/lib/observable')

var BridgeObservable = new Observable({
  on: {
    change: {
      bridge: function (event) {
        this.getRoot().emit('bridge', event, this)
      }
    }
  },
  ChildConstructor: 'Constructor'
}).Constructor

module.exports = exports = BridgeObservable
