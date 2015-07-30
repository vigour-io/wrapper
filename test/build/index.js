var chai = require('chai') // TODO Remove this when gaston allows it
var expect = chai.expect	// TODO Remove this when gaston allows it

var path = require('path')
var build = require('../../lib/build')

// TODO Remove dependency on vigour-example being checkout-out in same directory as vigour-native
var repo = path.join(__dirname
	, '..', '..', '..', 'vigour-example')
var pkgPath = path.join(repo, 'package.json')
var pkg = require(pkgPath)
var opts = pkg.vigour.native
opts.packer = pkg.vigour.packer
opts.cwd = repo
opts.root = repo
var options = JSON.stringify(opts)

var timeout = 30000

describe("build", function () {
	it("ios should succeed in under " + timeout +  " milliseconds!"
	, function (done) {
		var _options = JSON.parse(options)
		this.timeout(timeout)
		_options.platforms.android = false
		console.log('iOS options', JSON.stringify(_options, null, 2))
		build(_options)
			.then(function (result) {
				console.log("Result", result)
				done()
			})
	})
	it("android should succeed in under " + timeout + " milliseconds!"
	, function (done) {
		var _options = JSON.parse(options)
		this.timeout(timeout)
		_options.platforms.ios = false
		console.log('Android options', JSON.stringify(_options, null, 2))
		build(_options)
			.then(function (result) {
				console.log("Result", result)
				done()
			})
	})
})