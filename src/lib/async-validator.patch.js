import defaults from 'lodash/defaults'
import * as util from 'async-validator/lib/util'

util.format = (message) => message

util.complementError = function complementError (rule) {
  return function (oe) {
    if (oe && oe.message) {
      oe.field = oe.field || rule.fullField
      return defaults(oe, rule)
    }
    return defaults({
      message: oe,
      field: oe.field || rule.fullField
    }, rule)
  }
}
