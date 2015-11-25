var log = require('npmlog')
var fs = require('vigour-fs/lib/server')

function Template () {
  this.filename =
    this.contents = []
  this.currentLine = 0
}

Template.prototype.readFile = function (filename) {
  this.filename = filename
  this.contents = fs.readFileSync(filename, {encoding: 'utf8'}).split('\n')
  this.currentLine = 0
}

Template.prototype.save = function () {
  log.info('save to', this.filename)
  fs.writeFileSync(this.filename, this.contents.join('\n'))
}

/** set the currentLine directly after the first occurence of pattern. */
Template.prototype.goto = function (pattern) {
  for (var i = 0; i < this.contents.length; i++) {
    if (this.contents[i].match(pattern)) {
      this.currentLine = i + 1
    }
  }
}

Template.prototype.insertLine = function (line) {
  this.contents.splice(this.currentLine, 0, line)
  this.currentLine++
}

Template.prototype.commentLine = function (line) {
  this.contents[this.currentLine] = '//' + this.contents[this.currentLine]
  this.currentLine++
}

Template.prototype.log = function () {
  log.info('logging:')
  log.info(this.contents.join('\n'))
}

module.exports = exports = Template
