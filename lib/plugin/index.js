'use strict'
var Observable = require('vigour-observable')
var PluginProperty = new Observable({
  inject: require('vigour-observable/lib/operator/type'),
  define: {
    _platform: {
      get () {
        return this.__platform || this.parent._platform
      },
      set (val) {
        this.setKey('__platform', val)
      }
    }
  },
  ChildConstructor: 'Constructor'
}).Constructor

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
    inject: require('vigour-observable/lib/observable/is'),
    on: {
      value (val, event) {
        // console.log('ready value update!', this.parent._platform)
        this.parent._platform.ready.set(val, event)
      }
    }
  },
  define: {
    init () {
      this._platform.emit('init')
    }
  },
  ChildConstructor: PluginProperty
}).Constructor
