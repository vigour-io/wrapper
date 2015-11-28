'use strict'

var bridge = require('./')

exports.properties = {
  bridge: {
    val: bridge
  }
}

exports.on = {
  ready: {
    bridge () {
      this.ready.val = true
    }
  }
}

exports.define = {
  key: {
    set (val) {
      this._key = val
      bridge.registerPlugin(this)
    },
    get () {
      return this._key
    }
  },
  send (methodName, params, cb) {
    bridge.send(this.key, methodName, params, cb)
  }
}
