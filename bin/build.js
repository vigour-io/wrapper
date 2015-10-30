#!/usr/bin/env node --use_strict

var pliant = require('pliant')
var builder = require('../lib/builder')
var config = require('../lib/builder/config')
pliant.bin(config, builder)
