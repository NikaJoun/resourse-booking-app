<template>
  <div class="form-group">
    <input
      :type="type"
      class="form-input"
      :value="modelValue"
      :placeholder="floatingLabel ? ' ' : ''"
      :required="required"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <label v-if="label">{{ label }}</label>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: String,
    label: String,
    type: {
      type: String,
      default: 'text'
    },
    required: Boolean,
    floatingLabel: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue']
};
</script>

<style lang="scss" scoped>
.form-group {
  position: relative;
  
  .form-input {
    width: 100%;
    padding: 14px 16px;
    font-size: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #fafafa;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:focus {
      border-color: #a0a0a0;
      background: white;
      outline: none;
      box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.1);
    }
    
    &:not(:placeholder-shown) + label,
    &:focus + label {
      transform: translateY(-24px) scale(0.9);
      background: white;
      padding: 0 4px;
      left: 12px;
      color: #555;
    }
  }
  
  label {
    position: absolute;
    left: 16px;
    top: 14px;
    color: #999;
    font-size: 16px;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>