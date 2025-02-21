let objectify = require('./obje')

module.exports = function processResult(result) {
  if (console && console.warn) {
    result.warnings().forEach(warn => {
      let source = warn.plugin || 'FS_CSS'
      console.warn(source + ': ' + warn.text)
    })
  }
  return objectify(result.root)
}
