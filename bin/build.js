#!/usr/bin/env node
'use strict'

var Config = require('vigour-config')
var config = new Config()
/* Service is the builder
  builder is capable of building for multiple platforms based on templates + lib/builder/* files
*/
// TODO: rename to wrapper
var Service = require('../lib/builder')

var service = new Service(config)
service.start()
  .catch(function (reason) {
    console.error('Noooo', reason, reason.stack)
    process.exit(1)
  })
