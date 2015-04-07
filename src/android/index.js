var fs = require('vigour-fs')
  , ncp = require('ncp')
  , path = require('path')
  , Promise = require('promise')
  
  , _mkdir = Promise.denodeify(fs.mkdirp)
  , _ncp = function() {
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function(resolve, reject) {
      try {
        args.push(function(err) {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
        ncp.apply(this, args)
      } catch (e) {
        console.log("ncp fails", e, e.stack)
        reject(e)
      }
    })}

function installTemplate() {
  // if(!fs.existsSync('build/android')) {
    console.log('- Copying android template')
    var src = path.join(__dirname, '..', '..', 'templates', 'android')
      , dst = path.join(process.cwd(), 'build/android')

    console.log("from", src)
    console.log("to", dst)
    return _mkdir(dst)
      .then(function () {
        _ncp(src
          , dst 
          , {clobber: true})
      })
      .catch(function (reason) {
        console.error("Oops", reason)
      })
}

function compile() {
  console.log("Compiling (coming soon)")
  return true;
}

module.exports = exports = {}
exports.build = function() {
  console.log('start android build')
  return installTemplate()
    .then(compile)
    .then(console.log('end android build'))
    .catch(function(reason) {
        console.error(reason)
    })
}

