var path = require('path')
var version = require('../../package.json').version
var config = module.exports = exports = {}

config.version = version

config.items =
	{ "vigour.native.selectedPlatforms":
		{ def: null
		, env: "VNATIVE_PLATFORMS"
		, cli: "-p, --platforms <platformList>"
		, desc: "Comma-separated list of platforms to build (builds all by default)"
		}
	, "vigour.native.root":
		{ def: process.cwd()
		, env: "VNATIVE_ROOT"
		, cli: "--root <path>"
		, desc: "Path to the root directory of the project to be built"
		}
	}

config.files =
	{ def: path.join(process.cwd(), 'package.json')
	, env: "VNATIVE_CONFIG_FILES"
	}