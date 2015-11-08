'use strict'

var Observable = require('vigour-js/lib/observable')

var BridgeObservable = new Observable({
  inject: require('vigour-js/lib/methods/plain'),
  on: {
    data: {
      condition: function (data, next, event) {
        this.getRoot().once('bridge', function () {
          // this once needs to be removed when its failing!
          next()
        })
        this.getRoot().emit('bridge', this)
      }
    }
  },
  ChildConstructor: 'Constructor'
}).Constructor

module.exports = exports = BridgeObservable
