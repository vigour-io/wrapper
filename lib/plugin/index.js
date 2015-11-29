'use strict'
var Observable = require('vigour-js/lib/observable')

module.exports = new Observable({
  initialised: {
    val: false,
    on: {
      data: {
        initialised () {
          if (!this.val) {
            this.parent.ready.origin.val = false
          }
        }
      }
    }
  },
  loading: false,
  ready: {
    val: false,
    inject: require('vigour-js/lib/observable/is')
  },
  ChildConstructor: new Observable({
    define: {
      platform: {
        get () {
          return this._platform || this.parent.platform
        },
        set (val) {
          this.setKey('_platform', val)
        }
      }
    }
  }),
  define: {
    init () {
      this.platform.emit('init')
    }
  }
}).Constructor
