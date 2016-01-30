#!/usr/bin/env node
'use strict'

var Config = require('vigour-config')
var config = new Config()
var Service = require('../lib/builder')

var service = new Service(config)
service.start()
  .catch(function (reason) {
    console.error('Noooo', reason, reason.stack)
    process.exit(1)
  })
