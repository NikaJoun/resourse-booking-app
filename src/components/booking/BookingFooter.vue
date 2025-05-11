<template>
  <footer class="booking-footer">
    <button 
      v-if="step > 1" 
      @click="$emit('prev')" 
      class="btn btn-secondary"
    >
      <i class="bi bi-chevron-left"></i> Назад
    </button>
    <div class="footer-spacer"></div>
    <button 
      v-if="step < 4" 
      @click="$emit('next')" 
      class="btn btn-primary"
      :disabled="!canProceed"
    >
      Далее <i class="bi bi-chevron-right"></i>
    </button>
    <button 
      v-if="step === 4" 
      @click="$emit('confirm')" 
      class="btn btn-confirm"
      :disabled="!canConfirm"
    >
      <i class="bi bi-check-lg"></i> Подтвердить бронь
    </button>
  </footer>
</template>

<script>
export default {
  props: {
    step: {
      type: Number,
      required: true
    },
    canProceed: {
      type: Boolean,
      default: false
    },
    canConfirm: {
      type: Boolean,
      default: false
    }
  },
  emits: ['prev', 'next', 'confirm']
};
</script>

<style scoped>
.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.footer-spacer {
  flex: 1;
}

.btn {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn i {
  margin: 0 0.25rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-primary {
  background: #0d6efd;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0b5ed7;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.btn-confirm {
  background: #198754;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #157347;
  box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
}

@media (max-width: 480px) {
  .booking-footer {
    flex-direction: column-reverse;
    gap: 1rem;
  }
  
  .booking-footer .btn {
    width: 100%;
  }
}
</style>