'use strict'

var log = require('npmlog')
var spawn = require('vigour-spawn')
var fs = require('vigour-fs');
var path = require('path');

module.exports = exports = function () {
	if (this.builds) {
		var baseDir = this.baseDir

		function clearPods() {
			log.info('- clearing pods directory -')
			var podsDir = path.join(baseDir, 'Pods')
			log.info('pods dir:', podsDir)
			// implementing custom promise wrapper - fs.remove on vigour-fs-promised is broken
			return new Promise(function (resolve, reject) {
				fs.remove(podsDir, {
					disableGlob: true,
				}, function (err) {
					err ? reject(err) : resolve()
				})
			})
		}

		function installPods() {
			log.info('- install pods -')
			return spawn('pod install', { cwd: baseDir })
		}
		
		return clearPods().then(installPods)
	} else {
		log.info('- skipping install pods -')
	}
}
