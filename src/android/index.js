var fs = require('vigour-fs')
  , ncp = require('ncp')
  , path = require('path')
  , Promise = require('promise')
  
  , _mkdir = Promise.denodeify(fs.mkdirp)
  , _ncp = function() {
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function(resolve, reject) {
      try {
        console.log("args", args)
        args.push(function(err) {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
        console.log('ncp', args)
        ncp.apply(this, args)
        console.log("WHA")
      } catch (e) {
        console.log("ERRRRR", e, e.stack)
        reject(e)
      }
    })}

function installTemplate() {
  // if(!fs.existsSync('build/android')) {
    console.log('- Copying android template')
    var dst = path.join(process.cwd(), 'build/android')
      , src = path.join(__dirname, '..', '..', 'templates', 'android')

    console.log(typeof src, typeof dst)
    return _mkdir(dst)
           .then(_ncp( src
                     , dst
                     , {clobber: true}))
  // }
  // return new Promise(function(resolve, reject) {
    // resolve('huppeldepup')
  // })
}

function compile() {
  console.log("we should be compiling now")
  return true;
}

module.exports = exports = function() {
  console.log('start android build')
  installTemplate()
    .then(compile)
    .then(console.log('end android build'))
    .catch(function(reason) {
        console.error(reason)
    })
}

