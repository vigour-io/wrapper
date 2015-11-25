#!/usr/bin/env node
'use strict'

var Config = require('vigour-js/lib/config')
var config = new Config()
var Service = require('../lib/builder')

var service = new Service(config)
service.start()
