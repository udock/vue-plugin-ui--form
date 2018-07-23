module.exports = {
  externals: [
    /lodash\/.*/,
    /async-validator\/lib\/.*/,
    'vue',
    '@udock/vue-plugin-ui'
  ],
  globals: {
    'async-validator/lib/index': 'asyncValidator',
    'async-validator/lib/util': 'asyncValidator.util',
    'lodash/defaults': '_.defaults',
    'lodash/extend': '_.extend',
    'lodash/get': '_.get',
    'lodash/isArray': '_.isArray',
    'lodash/isFunction': '_.isFunction',
    'lodash/isObject': '_.isObject',
    'lodash/noop': '_.noop',
    'lodash/template': '_.template',
    'vue': 'Vue',
    '@udock/vue-plugin-ui': 'vue-plugin-ui'
  }
}
