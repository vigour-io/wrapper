#!/usr/bin/env node
var npm = require('npm')
  , log = require('npmlog')
  , errors = 0
  , warnings = 0

npm.load(function (err, npm) {
  if (err) {
    log.error(err)
    errors += 1
  } else {
    if (npm.config.get('user-agent')
        .split(' ')[0]
        .split('/')[1][0] !== "2") {
      log.warn('`sudo npm update npm@^2 -g` OR use `./node_modules/.bin/npm')
      warnings += 1
    }
  }
  if (errors) {
    log.error(errors, "errors")
  }
  if (warnings) {
    log.warn(warnings, "warnings")
  }
  if (!errors && !warnings) {
    log.info("PASS")
  }
})
