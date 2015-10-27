var log = require('npmlog')
var proc = require('child_process')
var spawn = proc.spawn

function exe (command, cwd, opts) {
  var args = command.split(' ')
  var fnName = args[0]
  args = args.splice(1, args.length - 1)

  // scramble sensitive data after extracting fn and args
  if (opts && opts.scramble) {
    if (!(opts.scramble instanceof Array)) {
      opts.scramble = [opts.scramble]
    }
    opts.scramble.forEach(function (string) {
      command = command.replace(new RegExp(string, 'g'), Array(string.length + 1).join('*'))
    })
  }

  return new Promise(function (resolve, reject) {
    log.info('Executing', command)
    if (cwd === '') {
      cwd = process.cwd()
    }
    log.info('in', cwd)
    var call = spawn(fnName, args, { cwd: cwd })
    call.stdout.on('data', function (data) {
      log.stream.write(data)
    })

    call.stderr.on('data', function (data) {
      log.stream.write(data)
    })

    call.on('close', function (code) {
      if (code === 0) {
        resolve()
      } else {
        var error = new Error('failed command')
        error.info = {
          code: code,
          command: command
        }
        reject(error)
      }
    })
  })
}

module.exports = exports = exe
