'use strict'

var ua = require('vigour-ua')
var userAgent = typeof navigator !== 'undefined' && navigator.userAgent
exports.ua = ua(userAgent)
