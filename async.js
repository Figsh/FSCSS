let postcss = require('postcss')

let processResult = require('./process-result')
let parse = require('./fscss_exec')

module.exports = function async(plugins) {
  let processor = postcss(plugins)
  return async input => {
    let result = await processor.process(input, {
      parser: parse,
      from: undefined
    })
    return processResult(result)
  }
}
