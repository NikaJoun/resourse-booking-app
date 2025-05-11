<template>
  <div class="booking-card" :class="bookingClass">
    <div class="booking-header">
      <span class="resource-name">{{ booking.resourceName }}</span>
      <span v-if="booking.isExpired" class="badge bg-danger">Истекло</span>
    </div>
    <div class="booking-user">{{ userName }}</div>
    <div class="booking-time">
      {{ booking.time }} - {{ calculateEndTime(booking.time, booking.duration) }}
    </div>
  </div>
</template>

<script>
import { calculateEndTime } from '@/utils/dateUtils';
import { useStore } from 'vuex';
import { computed } from 'vue';

export default {
  name: 'BookingCard',
  props: {
    booking: Object
  },
  setup(props) {
    const store = useStore();
    
    const userName = computed(() => {
      return store.getters['users/getUserNameById'](props.booking.userId) || 
             `Пользователь ${props.booking.userId}`;
    });

    const bookingClass = computed(() => {
      if (props.booking.isExpired) return 'booking-expired';
      return props.booking.isConfirmed ? 'booking-confirmed' : 'booking-pending';
    });

    return {
      userName,
      bookingClass,
      calculateEndTime
    };
  }
};
</script>

<style scoped>
.booking-card {
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  .booking-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.25rem;
    
    .resource-name {
      font-weight: 500;
      color: #212529;
    }
    
    .badge {
      font-size: 0.65rem;
      padding: 0.2rem 0.4rem;
    }
  }
  
  .booking-user {
    color: #6c757d;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }
  
  .booking-time {
    color: #6c757d;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    &:before {
      content: '';
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
    }
  }
  
  &.booking-confirmed {
    border-left: 3px solid #198754;
    background-color: rgba(25, 135, 84, 0.1);
    
    .booking-time:before {
      background-color: #198754;
    }
  }
  
  &.booking-pending {
    border-left: 3px solid #ffc107;
    background-color: rgba(255, 193, 7, 0.1);
    
    .booking-time:before {
      background-color: #ffc107;
    }
  }
  
  &.booking-expired {
    border-left: 3px solid #dc3545;
    background-color: rgba(220, 53, 69, 0.1);
    
    .booking-time:before {
      background-color: #dc3545;
    }
  }
}

@media (max-width: 768px) {
  .booking-card {
    font-size: 0.7rem;
    
    .booking-user,
    .booking-time {
      font-size: 0.65rem;
    }
  }
}
</style>