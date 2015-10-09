var Observable = require('vjs/lib/observable')

var BridgeObservable = new Observable({
  on: {
    data: {
      condition: function (data, next, event) {
        this.getRoot().once('bridge', function () {
          next()
        })
        this.getRoot().emit('bridge', this)
      }
    }
  },
  ChildConstructor: 'Constructor'
}).Constructor

module.exports = exports = BridgeObservable
