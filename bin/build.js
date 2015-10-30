#!/usr/bin/env node
'use strict'

var pliant = require('pliant')
var builder = require('../lib/builder')
var config = require('../lib/builder/config')
pliant.bin(config, builder)
