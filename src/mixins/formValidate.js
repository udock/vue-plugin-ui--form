import extend from 'lodash/extend'
import componentsOptions from '../config/components-options'

export default {
  componentName: 'ElForm',
  props: {
    model: Object,
    rules: Object,
    labelPosition: String,
    labelWidth: String,
    labelSuffix: {
      type: String,
      default: ''
    },
    inline: Boolean,
    showMessage: {
      type: Boolean,
      default: true
    },
    customizeError: Boolean,
    labelClass: {
      type: String
    },
    contentClass: {
      type: String
    }
  },
  watch: {
    rules () {
      this.validate()
    }
  },
  data () {
    return {
      fields: []
    }
  },
  computed: {
    computedRules () {
      return extend({}, componentsOptions.validator.rules, this.rules)
    }
  },
  created () {
    this.$on('u.form.resolveItem', (error) => {
      this.$emit('handleItem', error)
    })
    this.$on('u.form.addField', (field) => {
      if (field) {
        this.fields.push(field)
      }
    })
    this.$on('u.form.removeField', (field) => {
      if (field.prop) {
        this.fields.splice(this.fields.indexOf(field), 1)
      }
    })
  },
  methods: {
    resetFields () {
      this.fields.forEach(field => {
        field.resetField()
      })
    },
    validate (callback, options) {
      let count = 0
      if (this.fields.length === 0 && callback) {
        callback(null)
        return
      }
      let allItemError = []
      this.fields.forEach((field, index) => {
        field.validate('', (itemError) => {
          if (itemError) {
            allItemError.push(itemError)
          }
          if (typeof callback === 'function' && ++count === this.fields.length) {
            callback(allItemError.length === 0 ? null : allItemError)
          }
        }, extend({ trigger: 'form', silent: false }, options))
      })
    },
    validateField (prop, cb, options) {
      const field = this.fields.filter(field => field.prop === prop)[0]
      if (!field) { throw new Error('must call validateField with valid prop string!') }
      field.validate('', cb, extend({ trigger: 'field' }, options))
    }
  }
}
