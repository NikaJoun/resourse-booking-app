<template>
  <div class="step-content confirmation-step">
    <h2>Подтверждение бронирования</h2>
    <div class="confirmation-details">
      <div class="detail-card">
        <div class="detail-icon">
          <i :class="getResourceIcon(resource.type)"></i>
        </div>
        <div class="detail-info">
          <h3>Ресурс</h3>
          <p>{{ resource.name }}</p>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-icon">
          <i class="bi bi-calendar-date"></i>
        </div>
        <div class="detail-info">
          <h3>Дата</h3>
          <p>{{ formattedDate }}</p>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-icon">
          <i class="bi bi-clock"></i>
        </div>
        <div class="detail-info">
          <h3>Время</h3>
          <p>{{ time }} - {{ endTime }}</p>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-icon">
          <i class="bi bi-hourglass"></i>
        </div>
        <div class="detail-info">
          <h3>Продолжительность</h3>
          <p>{{ duration }} {{ hourText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { getResourceIcon, formatSelectedDate, calculateEndTime, getHourText } from '@/utils/booking';

export default {
  props: {
    resource: {
      type: Object,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const formattedDate = computed(() => formatSelectedDate(props.date));
    const endTime = computed(() => calculateEndTime(props.time, props.duration));
    const hourText = computed(() => getHourText(props.duration));

    return {
      formattedDate,
      endTime,
      hourText,
      getResourceIcon
    };
  }
};
</script>

<style scoped>
.confirmation-step .confirmation-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.detail-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: rgba(13, 110, 253, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: #0d6efd;
  font-size: 1.25rem;
}

.detail-info h3 {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.detail-info p {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}
</style>