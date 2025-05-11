<template>
  <header class="booking-header">
    <h1>Бронирование ресурсов</h1>
    <div class="booking-steps">
      <div v-for="(stepInfo, index) in steps" :key="index" 
           :class="['step', { active: step === index + 1 }]">
        <span class="step-number">{{ index + 1 }}</span>
        <span class="step-title">{{ stepInfo.title }}</span>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  props: {
    step: {
      type: Number,
      required: true
    }
  },
  setup() {
    const steps = [
      { title: 'Тип ресурса' },
      { title: 'Выбор ресурса' },
      { title: 'Дата и время' },
      { title: 'Подтверждение' }
    ];

    return { steps };
  }
};
</script>

<style scoped>
.booking-header {
  text-align: center;
  margin-bottom: 2rem;
}

.booking-header h1 {
  font-size: 2.25rem;
  font-weight: 600;
  color: #0d6efd;
  margin-bottom: 1.5rem;
}

.booking-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: 3rem;
}

.booking-steps:before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e0e0e0;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  cursor: default;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.step-title {
  color: #757575;
  font-size: 0.875rem;
  text-align: center;
  max-width: 100px;
}

.step.active .step-number {
  background: #0d6efd;
  color: white;
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.2);
}

.step.active .step-title {
  color: #0d6efd;
  font-weight: 500;
}
</style>