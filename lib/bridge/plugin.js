'use strict'

var bridge = require('./')
var Observable = require('vigour-js/lib/observable')

var Plugin = new Observable({
  inject: [
    require('vigour-js/lib/methods/plain'),
    require('vigour-js/lib/methods/setWithPath')
  ],
  on: {
    new: {
      bridge () {
        bridge.registerPlugin(this)
      }
    }
  }
}).Constructor

module.exports = Plugin
