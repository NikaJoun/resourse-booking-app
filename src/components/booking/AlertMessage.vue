<template>
  <div :class="['alert', `alert-${type}`]">
    <i :class="iconClass"></i>
    {{ message }}
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      validator: (value) => ['error', 'success'].includes(value),
      default: 'error'
    },
    message: {
      type: String,
      required: true
    }
  },
  computed: {
    iconClass() {
      return {
        'error': 'bi bi-exclamation-circle',
        'success': 'bi bi-check-circle'
      }[this.type];
    }
  }
};
</script>

<style scoped>
.alert {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  font-weight: 500;
}

.alert i {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.alert-error {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border-left: 4px solid #dc3545;
}

.alert-success {
  background: rgba(25, 135, 84, 0.1);
  color: #198754;
  border-left: 4px solid #198754;
}
</style>