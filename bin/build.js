#!/usr/bin/env node
var pliant = require('pliant')
var build = require('../lib/build')
var config = require('../lib/build/config')
pliant.bin(build, config)
