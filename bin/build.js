#!/usr/bin/env node
'use strict'

var pliant = require('vigour-pliant')
var builder = require('../lib/builder')
var config = require('../lib/builder/config')
pliant.bin(config, builder)
