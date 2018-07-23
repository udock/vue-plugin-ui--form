import get from 'lodash/get'
import extend from 'lodash/extend'
import UForm from './components/form'
import UFormItem from './components/form-item'
import componentsOptions from './config/components-options'

UForm.Item = UFormItem

const install = UForm.install = function (Vue, options = {}) {
  if (install.installed) return
  const getValidatorOption = (key) => {
    return get(options, `validator.${key}.default`) || get(options, `validator.${key}`) || {}
  }
  extend(
    componentsOptions.validator,
    {
      rules: getValidatorOption('rules'),
      messages: getValidatorOption('messages')
    }
  )
  if (!options.scoped) {
    Vue.component(options.name || UForm.name, UForm)
    Vue.component(get(options, 'children.Item.name') || UFormItem.name, UFormItem)
  }
}

export default UForm
