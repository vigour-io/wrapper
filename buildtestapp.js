#!/usr/bin/env node --use_strict
var path = require('path')
var spawn = require('vigour-spawn')

build()

function build () {
  return spawn('npm', ['run', 'build'], {
    cwd: path.join(__dirname, 'test', 'app')
  })
}
