#!/usr/bin/env node
var path = require('path')
var spawn = require('./spawn')

install()

function install () {
  return spawn('npm', ['install'], {
    cwd: path.join(__dirname, 'test', 'app')
  })
}
