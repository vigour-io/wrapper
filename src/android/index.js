var fs = require('vigour-fs')
  , ncp = require('ncp')
  , path = path('path')

exports = function() {
  console.log('start android build')

  if(!fs.existsSync('build/android')) {
    console.log('- Copying android template')
    ncp(path.join(__dirname, '../..', 'templates/android'), path.join(process.cwd(), ''
  }




  console.log('end android build')
}

function exists(path) {
  fs.exists
}

function cp(source, target, cb) {
  var cbCalled = false
    , rs
    , ws

  targetDir = target.slice(0, target.lastIndexOf('/'))
  fs.mkdirp(targetDir, function (err) {
  var cbCalled = false
    , rs
    , ws
  if (err) {
    cb(err)
    return
  }
    rs = fs.createReadStream(source)
    ws = fs.createWriteStream(target)

  log.info('Copying', source, 'to', target)
  rs.on("error", function (err) {
    done(err)
  })

  ws.on("error", function (err) {
    done(err)
  })

  ws.on("close", function (ex) {
    done(null)
  })

  rs.pipe(ws)

  function done (err) {
    if (!cbCalled) {
      cb(err)
      cbCalled = true
    }
  }
  })
}
