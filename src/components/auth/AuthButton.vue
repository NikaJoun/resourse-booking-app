<template>
  <button 
    type="submit" 
    class="auth-button"
    :disabled="loading"
  >
    <span v-if="!loading">{{ label }}</span>
    <span v-else>Загрузка...</span>
  </button>
</template>

<script>
export default {
  props: {
    loading: Boolean,
    label: {
      type: String,
      default: 'Войти'
    }
  }
};
</script>

<style lang="scss" scoped>
.auth-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(107, 115, 255, 0.2);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(107, 115, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>