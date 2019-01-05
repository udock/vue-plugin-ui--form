<template>
  <form class="u-form" :class="[
    labelPosition ? 'u-form--label-' + labelPosition : '',
    { 'u-form--inline': inline }
  ]">
    <slot></slot>
  </form>
</template>
<script>
import formValidate from '../mixins/formValidate'
export default {
  name: 'UForm',
  mixins: [formValidate]
}
</script>
