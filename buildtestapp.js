#!/usr/bin/env node
var path = require('path')
var spawn = require('./spawn')

build()

function build () {
  return spawn('npm', ['run', 'build'], {
    cwd: path.join(__dirname, 'test', 'app')
  })
}
