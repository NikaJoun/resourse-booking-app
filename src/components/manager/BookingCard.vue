<template>
  <div class="admin-card booking-card">
    <div class="card-header">
      <div class="resource-icon" :class="getBookingStatusClass(booking)">
        <i :class="getBookingIcon(booking)"></i>
      </div>
      <div class="resource-title">
        <h3 class="booking-title">Бронирование #{{ booking.id }}</h3>
        <div class="resource-type">
          {{ formatLongDate(booking.date) }} — {{ getBookingTimeRange(booking) }}
        </div>
      </div>
    </div>

    <div class="card-body">
      <div class="info-row">
        <i class="bi bi-collection"></i>
        <div class="info-label">Ресурс:</div>
        <div class="info-value">{{ resourceName }}</div>
      </div>
      <div class="info-row">
        <i class="bi bi-person"></i>
        <div class="info-label">Пользователь:</div>
        <div class="info-value">{{ userName }}</div>
      </div>
      <div class="info-row">
        <i class="bi bi-clock"></i>
        <div class="info-label">Продолжительность:</div>
        <div class="info-value">{{ booking.duration }} ч</div>
      </div>
      <div class="info-row">
        <i class="bi bi-info-circle"></i>
        <div class="info-label">Статус:</div>
        <div class="info-value">
          <span :class="statusTextClass">{{ statusText }}</span>
        </div>
      </div>
    </div>

    <div v-if="showActions" class="card-actions">
      <button 
        @click="$emit('confirm', booking.id)" 
        class="btn btn-sm btn-success"
      >
        <i class="bi bi-check-lg"></i> Подтвердить
      </button>
      <button 
        @click="$emit('reject', booking.id)" 
        class="btn btn-sm btn-outline-danger"
      >
        <i class="bi bi-x-lg"></i> Отклонить
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { formatLongDate, getBookingTimeRange } from '@/utils/dateUtils';
import { getBookingStatusClass, getBookingIcon, getStatusText, getStatusTextClass } from '@/utils/bookingUtils';

export default {
  name: 'BookingCard',
  props: {
    booking: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: false
    }
  },
  emits: ['confirm', 'reject'],
  setup(props) {
    const store = useStore();
    
    const resourceName = computed(() => {
      const resources = store.state.resources?.resources || [];
      const resource = resources.find(r => r.id === props.booking.resourceId);
      return resource ? resource.name : 'Неизвестный ресурс';
    });
    
    const userName = computed(() => {
      const users = store.state.users?.users || [];
      const user = users.find(u => u.id === props.booking.userId);
      return user ? user.username : 'Неизвестный пользователь';
    });
    
    const statusText = computed(() => getStatusText(props.booking));
    const statusTextClass = computed(() => getStatusTextClass(props.booking));
    
    return {
      resourceName,
      userName,
      statusText,
      statusTextClass,
      formatLongDate,
      getBookingTimeRange,
      getBookingStatusClass,
      getBookingIcon
    };
  }
}
</script>

<style scoped>
.booking-card {
  border-radius: 10px;
  background-color: #fff;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
  border: 1px solid #e5e5e5;
}

.booking-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.resource-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.booking-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
}

.resource-type {
  font-size: 0.9rem;
  color: #6c757d;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #343a40;
  line-height: 1.3;
}

.info-label {
  font-weight: 500;
  min-width: 110px;
  color: #495057;
}

.info-value {
  color: #212529;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #f1f1f1;
}

.resource-icon.pending {
  background-color: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.resource-icon.confirmed {
  background-color: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

.resource-icon.completed {
  background-color: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.resource-icon.cancelled {
  background-color: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.text-success {
  color: #28a745;
  font-weight: 500;
}

.text-warning {
  color: #ffc107;
  font-weight: 500;
}

.text-danger {
  color: #dc3545;
  font-weight: 500;
}
</style>