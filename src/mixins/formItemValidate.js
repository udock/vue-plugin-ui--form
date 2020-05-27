import isFunction from 'lodash/isFunction'
import isObject from 'lodash/isObject'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import template from 'lodash/template'
import reduce from 'lodash/reduce'
import get from 'lodash/get'
import noop from 'lodash/noop'
import '../lib/async-validator.patch'
import AsyncValidator from 'async-validator/lib/index'
import componentsOptions from '../config/components-options'

function getPropByPath (obj, path) {
  let tempObj = obj
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')
  let keyArr = path.split('.')
  let i = 0
  for (let len = keyArr.length; i < len - 1; ++i) {
    let key = keyArr[i]
    if (key in tempObj) {
      tempObj = tempObj[key]
    } else {
      throw new Error('please transfer a valid prop path to form item!')
    }
  }
  return {
    o: tempObj,
    k: keyArr[i],
    v: tempObj[keyArr[i]]
  }
}

export default {
  beforeCreate () {
    this.$options.name = 'FormItem'
    this.$options.componentName = 'ElFormItem'
  },
  props: {
    label: String,
    labelWidth: String,
    prop: String,
    required: Boolean,
    rules: [Object, Array, String],
    error: String,
    validateStatus: String,
    showMessage: {
      type: Boolean,
      default: true
    },
    customizeError: {
      type: Boolean,
      default: false
    },
    autoFocus: {
      type: Boolean,
      default: true
    },
    labelClass: {
      type: String
    },
    contentClass: {
      type: String
    }
  },
  watch: {
    error (value) {
      this.validateMessage = value
      this.validateState = value ? 'error' : ''
    },
    validateStatus (value) {
      this.validateState = value
    }
  },
  computed: {
    validateMessage: {
      get () {
        if (this.validateState === 'success') return ''
        let rule = this.validateError
        if (rule) {
          rule.label = this.label
          let compiled = template(rule.message, {
            imports: {
              t: (key) => {
                let ret = this.$t(key)
                return template(ret)(rule)
              }
            }
          })
          return compiled(rule) || ''
        }
        return ''
      },
      set (v) {
        if (this.validateError) this.validateError.message = v
      }
    },
    labelStyle () {
      const ret = {}
      if (this.form.labelPosition === 'top') return ret
      const labelWidth = this.labelWidth || this.form.labelWidth
      if (labelWidth) {
        ret.width = labelWidth
      }
      return ret
    },
    contentStyle () {
      const ret = {}
      if (this.form.labelPosition === 'top' || this.form.inline) return ret
      const labelWidth = this.labelWidth || this.form.labelWidth
      if (labelWidth) {
        ret.marginLeft = labelWidth
      }
      return ret
    },
    form () {
      let parent = this.$parent
      while (parent.$options.componentName !== 'ElForm') {
        parent = parent.$parent
      }
      return parent
    },
    fieldValue: {
      cache: false,
      get () {
        const model = this.form.model
        if (!model || !this.prop) { return }
        let path = this.prop
        if (path.indexOf(':') !== -1) {
          path = path.replace(/:/, '.')
        }
        return getPropByPath(model, path).v
      }
    }
  },
  data () {
    return {
      validateState: '',
      validateDisabled: false,
      validator: {},
      isRequired: false,
      validateError: {},
      silent: false
    }
  },
  methods: {
    resolveRuleClass: function (obj) {
      return obj ? isObject(obj) && !isArray(obj) ? [obj] : obj : false
    },
    validate (trigger, callback = noop, options = {}) {
      const rules = this.getFilteredRule(trigger)
      trigger = trigger || options.trigger
      let cb = (error) => {
        if (!options.silent) this.dispatch('UForm', 'u.form.resolveItem', error)
        callback(error)
      }
      if (!rules || rules.length === 0) {
        cb(null)
        return true
      }
      this.silent = options.silent
      this.validateState = 'validating'
      const descriptor = {}
      descriptor[this.prop] = rules
      const validator = new AsyncValidator(descriptor)
      validator.messages(componentsOptions.validator.messages)
      const model = {}
      model[this.prop] = this.fieldValue
      validator.validate(model, { first: true, trigger }, (errors, fields) => {
        this.validateState = !errors ? 'success' : 'error'
        this.validateError = errors && errors[0]
        const itemErrorObj = this.validateMessage !== '' ? { message: this.validateMessage, trigger, vm: this } : null
        cb(itemErrorObj)
      })
    },
    resetField () {
      this.validateState = ''
      this.validateMessage = ''
      let model = this.form.model
      let value = this.fieldValue
      let path = this.prop
      if (path.indexOf(':') !== -1) {
        path = path.replace(/:/, '.')
      }
      let prop = getPropByPath(model, path)
      if (Array.isArray(value)) {
        this.validateDisabled = true
        prop.o[prop.k] = [].concat(this.initialValue)
      } else {
        this.validateDisabled = true
        prop.o[prop.k] = this.initialValue
      }
    },
    formatArray (v = []) {
      return !isArray(v) && isObject(v) ? [v] : v
    },
    getRules () {
      return this.mergedRules
    },
    getFilteredRule (trigger) {
      const rules = this.getRules()
      return rules.filter(rule => {
        return !rule.trigger || rule.trigger.indexOf(trigger) !== -1
      })
    },
    onFieldBlur () {
      this.validate('blur')
    },
    onFieldChange () {
      if (this.validateDisabled) {
        this.validateDisabled = false
        return
      }
      this.validate('change')
    }
  },
  mounted () {
    if (this.prop) {
      this.dispatch('UForm', 'u.form.addField', [this])
      let initialValue = this.fieldValue
      if (Array.isArray(initialValue)) {
        initialValue = [].concat(initialValue)
      }
      Object.defineProperty(this, 'initialValue', {
        value: initialValue
      })

      const rules = this.mergedRules = isString(this.rules)
        ? reduce(this.rules.split(/\s*,\s*/), (ret, item) => ret.concat(get(this.form.computedRules, item)), [])
        : this.formatArray(this.rules || get(this.form.computedRules, this.prop))
      if (rules.length === 0 && process.env.NODE_ENV !== 'production') typeof console !== 'undefined' && console.warn(`[@udock/vue-plugin-ui--from] "${this.prop}" rule not found`)
      rules.forEach((rule) => {
        if (rule.validator) {
          rule.validator = rule.validator.bind(this.form)
        } else if (rule.revalidate) {
          rule.validator = (rule, value, callback, source, options) => {
            let revalidate = rule.revalidate
            if (isFunction(revalidate)) {
              revalidate = revalidate(this.form.model) || []
            }
            if (!isArray(revalidate)) { revalidate = [revalidate] }
            revalidate.forEach((r) => {
              this.form.validateField(r)
            })
            callback()
          }
        }
      })
      if (rules.length) {
        rules.every(rule => {
          if (rule.required) {
            this.isRequired = true
            return false
          }
        })
        this.$on(['el.form.blur', 'on-form-blur', 'u.form.blur'], this.onFieldBlur)
        this.$on(['el.form.change', 'on-form-change', 'u.form.change'], this.onFieldChange)
      }
    }
  },
  beforeDestroy () {
    this.dispatch('UForm', 'u.form.removeField', [this])
  }
}
