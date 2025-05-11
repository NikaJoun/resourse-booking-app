<template>
  <div class="tab-pane">
    <div v-if="bookings.length === 0" class="empty-state">
      <i class="bi bi-journal-x"></i>
      <p>Нет завершенных бронирований</p>
    </div>

    <div v-else class="booking-cards">
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
        <div class="booking-main">
          <div class="booking-date">
            <div class="booking-day">{{ formatDay(booking.date) }}</div>
            <div class="booking-month">{{ formatMonth(booking.date) }}</div>
          </div>
          <div class="booking-details">
            <h3>{{ getResourceName(booking.resourceId) }}</h3>
            <div class="booking-time">
              <i class="bi bi-clock"></i>
              {{ booking.time }} - {{ calculateEndTime(booking.time, booking.duration) }}
              ({{ booking.duration }} {{ getHourText(booking.duration) }})
            </div>
            <div :class="['booking-status', getStatusClass(booking)]">
              {{ getStatusText(booking) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  props: {
    bookings: {
      type: Array,
      required: true
    }
  },
  setup() {
    const store = useStore();

    const formatDay = (dateString) => {
      const date = new Date(dateString);
      return date.getDate();
    };

    const formatMonth = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', { month: 'short' });
    };

    const calculateEndTime = (startTime, duration) => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + duration;
      return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const getHourText = (hours) => {
      if (hours === 1) return 'час';
      if (hours < 5) return 'часа';
      return 'часов';
    };

    const getResourceName = (resourceId) => {
      return store.getters['resources/getResourceNameById'](resourceId);
    };

    const getStatusClass = (booking) => {
      if (booking.isCompleted) return 'completed';
      if (booking.isCancelled) return 'cancelled';
      if (store.getters['bookings/isBookingCompleted'](booking)) return 'expired';
      return booking.isConfirmed ? 'confirmed' : 'pending';
    };

    const getStatusText = (booking) => {
      if (booking.isCompleted) return 'Завершено';
      if (booking.isCancelled) return 'Отменено';
      if (store.getters['bookings/isBookingCompleted'](booking)) return 'Истекло';
      return booking.isConfirmed ? 'Подтверждено' : 'Ожидает подтверждения';
    };

    return {
      formatDay,
      formatMonth,
      calculateEndTime,
      getHourText,
      getResourceName,
      getStatusClass,
      getStatusText
    };
  }
};
</script>

<style lang="scss" scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
  
  i {
    font-size: 3rem;
    color: #adb5bd;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0;
  }
}

.booking-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.booking-card {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
}

.booking-main {
  display: flex;
  gap: 1rem;
}

.booking-date {
  width: 60px;
  height: 60px;
  background: #f8f9fa;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  .booking-day {
    font-size: 1.5rem;
    font-weight: 600;
    color: #212529;
  }
  
  .booking-month {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #6c757d;
    margin-top: -0.25rem;
  }
}

.booking-details {
  flex: 1;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #212529;
    margin-bottom: 0.5rem;
  }
  
  .booking-time {
    font-size: 0.9rem;
    color: #6c757d;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
    
    i {
      font-size: 0.9rem;
    }
  }
}

.booking-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
  
  &.confirmed {
    background-color: rgba(25, 135, 84, 0.1);
    color: #198754;
  }
  
  &.pending {
    background-color: rgba(255, 193, 7, 0.1);
    color: #ffc107;
  }
  
  &.completed {
    background-color: rgba(13, 110, 253, 0.1);
    color: #0d6efd;
  }
  
  &.cancelled {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
  }
  
  &.expired {
    background-color: rgba(108, 117, 125, 0.1);
    color: #6c757d;
  }
}

@media (max-width: 768px) {
  .booking-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .booking-main {
    flex-direction: column;
  }
  
  .booking-date {
    width: 100%;
    height: auto;
    flex-direction: row;
    justify-content: flex-start;
    gap: 1rem;
    padding: 0.5rem;
    
    .booking-day {
      font-size: 1.25rem;
    }
    
    .booking-month {
      margin-top: 0;
    }
  }
}
</style>