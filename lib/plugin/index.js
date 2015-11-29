'use strict'
var Observable = require('vigour-js/lib/observable')

module.exports = new Observable({
  inject: require('./platform'),
  initialised: {
    val: false,
    on: {
      data: {
        initialised () {
          if (!this.val) {
            this.parent.ready.val = false
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
  // define: {
  //   init () {
  //     this.platform.emit('init')
  //   }
  // },
  ChildConstructor: new Observable({
    loading:false,
    define: {
      plugin: {
        get () {
          var parent = this.parent
          return parent.plugin || parent
        }
      }
    }
  })
}).Constructor
