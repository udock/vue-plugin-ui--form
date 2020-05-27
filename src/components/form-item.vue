<template>
  <div class="u-form-item" :class="{
    'is-error': validateState === 'error' && !silent && !form.customizeError && !customizeError,
    'is-customize-error': validateState === 'error' && (form.customizeError || customizeError),
    'is-validating ivu-form-item-validating': validateState === 'validating',
    'is-required': isRequired || required
  }">
    <label :for="prop" class="u-form-item__label" :class="labelClass || form.labelClass" v-bind:style="labelStyle" v-if="label">
      <slot name="label">{{label + form.labelSuffix}}</slot>
    </label>
    <div class="u-form-item__content" :class="contentClass || form.contentClass" v-bind:style="contentStyle">
      <slot></slot>
      <transition name="el-zoom-in-top">
        <div v-if="validateState === 'error' && showMessage && form.showMessage">
          <div
            class="u-form-item__error u-form-item__custom-error"
            v-if="$slots.customError || $scopedSlots.customError">
            <slot :errorMessage="validateMessage" name="customError"></slot><br><br>
          </div>
          <div class="u-form-item__error">{{validateMessage}}</div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import formItemValidate from '../mixins/formItemValidate'
import { mixins } from '@udock/vue-plugin-ui'
export default {
  name: 'UFormItem',
  mixins: [ mixins.Emitter, formItemValidate ]
}
</script>
