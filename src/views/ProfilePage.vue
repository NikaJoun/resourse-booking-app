<template>
  <div class="profile-page">
    <div class="profile-header">
      <h1><i class="bi bi-person-circle"></i>Личный кабинет</h1>
      <div v-if="store.state.currentUser" class="user-welcome">
        <h2>Добро пожаловать, {{ store.state.currentUser.username }}!</h2>
        <button @click="showSyncModal = true" class="btn btn-primary sync-btn">
          <i class="bi bi-calendar-plus"></i> Синхронизировать все бронирования
        </button>
      </div>
    </div>

    <div class="profile-tabs">
      <div class="tabs-header">
        <button 
          @click="activeTab = 'active'" 
          :class="['tab-btn', { active: activeTab === 'active' }]"
        >
          <i class="bi bi-calendar-check"></i> Активные бронирования
        </button>
        <button 
          @click="activeTab = 'history'" 
          :class="['tab-btn', { active: activeTab === 'history' }]"
        >
          <i class="bi bi-clock-history"></i> История бронирований
        </button>
      </div>

      <div class="tabs-content">
        <!-- Активные бронирования -->
        <div v-if="activeTab === 'active'" class="tab-pane">
          <div v-if="activeBookings.length === 0" class="empty-state">
            <i class="bi bi-calendar-x"></i>
            <p>Нет активных бронирований</p>
          </div>

          <div v-else class="booking-cards">
            <div v-for="booking in activeBookings" :key="booking.id" class="booking-card">
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
                  <div :class="['booking-status', booking.isConfirmed ? 'confirmed' : 'pending']">
                    {{ booking.isConfirmed ? 'Подтверждено' : 'Ожидает подтверждения' }}
                  </div>
                </div>
              </div>
              <div class="booking-actions">
                <button @click="openCancelModal(booking.id)" class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-x-circle"></i> Отменить
                </button>
                <button @click="exportSingleBooking(booking)" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-download"></i> Экспорт
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'history'" class="tab-pane">
          <div v-if="bookingHistory.length === 0" class="empty-state">
            <i class="bi bi-journal-x"></i>
            <p>Нет завершенных бронирований</p>
          </div>

          <div v-else class="booking-cards">
            <div v-for="booking in bookingHistory" :key="booking.id" class="booking-card">
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
      </div>
    </div>
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h3><i class="bi bi-exclamation-triangle"></i> Подтверждение отмены</h3>
          </div>
          <div class="modal-body">
            <p>Вы уверены, что хотите отменить это бронирование?</p>
          </div>
          <div class="modal-footer">
            <button @click="closeCancelModal" class="btn btn-secondary">
              <i class="bi bi-arrow-left"></i> Отмена
            </button>
            <button @click="confirmCancel" class="btn btn-danger">
              <i class="bi bi-trash"></i> Подтвердить отмену
            </button>
          </div>
        </div>
      </div>
    </div>

    <CalendarExportModal 
      v-if="showSyncModal"
      :show="showSyncModal"
      @close="showSyncModal = false"
      @download="downloadICS"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import CalendarExportModal from '@/components/CalendarExportModal.vue';

export default {
  components: {
    CalendarExportModal
  },
  setup() {
    const store = useStore();

    const activeTab = ref('active');
    const showCancelModal = ref(false);
    const showSyncModal = ref(false);
    const selectedBookingId = ref(null);

    const activeBookings = computed(() => store.getters.userActiveBookings);
    const bookingHistory = computed(() => store.getters.userBookingHistory);

    const getResourceName = (resourceId) => {
      return store.getters.getResourceNameById(resourceId);
    };

    const getStatusClass = (booking) => {
      if (booking.isCompleted) return 'completed';
      if (booking.isCancelled) return 'cancelled';
      if (store.getters.isBookingCompleted(booking)) return 'expired';
      return booking.isConfirmed ? 'confirmed' : 'pending';
    };

    const getStatusText = (booking) => {
      if (booking.isCompleted) return 'Завершено';
      if (booking.isCancelled) return 'Отменено';
      if (store.getters.isBookingCompleted(booking)) return 'Истекло';
      return booking.isConfirmed ? 'Подтверждено' : 'Ожидает подтверждения';
    };

    const getHourText = (hours) => {
      if (hours === 1) return 'час';
      if (hours < 5) return 'часа';
      return 'часов';
    };

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

    const openCancelModal = (bookingId) => {
      selectedBookingId.value = bookingId;
      showCancelModal.value = true;
    };

    const closeCancelModal = () => {
      showCancelModal.value = false;
      selectedBookingId.value = null;
    };

    const confirmCancel = () => {
      if (selectedBookingId.value) {
        store.dispatch('cancelBooking', selectedBookingId.value);
      }
      closeCancelModal();
    };

    const generateICS = (bookings) => {
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Booking System//EN',
        'CALSCALE:GREGORIAN'
      ];

      const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };

      bookings.forEach(booking => {
        const resourceName = getResourceName(booking.resourceId);
        const startDate = new Date(`${booking.date}T${booking.time}`);
        const endDate = new Date(startDate.getTime() + booking.duration * 60 * 60 * 1000);
        
        icsContent.push(
          'BEGIN:VEVENT',
          `UID:${booking.id}@booking-system`,
          `DTSTAMP:${formatDate(new Date())}`,
          `DTSTART:${formatDate(startDate)}`,
          `DTEND:${formatDate(endDate)}`,
          `SUMMARY:Бронирование ${resourceName}`,
          `DESCRIPTION:Бронирование ресурса "${resourceName}" на ${booking.date} в ${booking.time}. Продолжительность: ${booking.duration} ч.`,
          `STATUS:${booking.isConfirmed ? 'CONFIRMED' : 'TENTATIVE'}`,
          'END:VEVENT'
        );
      });

      icsContent.push('END:VCALENDAR');
      return icsContent.join('\r\n');
    };

    const downloadICSFile = (icsContent, filename) => {
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const downloadICS = () => {
      const bookings = activeTab.value === 'active' ? activeBookings.value : bookingHistory.value;
      const icsContent = generateICS(bookings);
      downloadICSFile(icsContent, 'all-bookings.ics');
      
      store.dispatch('exportToCalendar');
      
      store.dispatch('addNotification', {
        userId: store.state.currentUser.id,
        text: 'Бронирования экспортированы в файл календаря',
        type: 'calendar-export'
      });
    };

    const exportSingleBooking = (booking) => {
      const icsContent = generateICS([booking]);
      downloadICSFile(icsContent, `booking-${booking.id}.ics`);
      
      store.dispatch('addNotification', {
        userId: store.state.currentUser.id,
        text: `Бронирование ${getResourceName(booking.resourceId)} экспортировано`,
        type: 'calendar-export'
      });
    };

    return {
      store,
      activeTab,
      activeBookings,
      bookingHistory,
      showCancelModal,
      showSyncModal,
      getResourceName,
      getStatusClass,
      getStatusText,
      getHourText,
      formatDay,
      formatMonth,
      calculateEndTime,
      openCancelModal,
      closeCancelModal,
      confirmCancel,
      downloadICS,
      exportSingleBooking
    };
  },
};
</script>

<style lang="scss" scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #212529;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    
    i {
      font-size: 1.8rem;
      color: #0d6efd;
    }
  }
  
  .user-welcome {
    h2 {
      font-size: 1.25rem;
      font-weight: 500;
      color: #495057;
      margin-bottom: 1.5rem;
    }
  }
  
  .sync-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    
    i {
      font-size: 1.1rem;
    }
  }
}

.profile-tabs {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #dee2e6;
  
  .tab-btn {
    flex: 1;
    padding: 1rem;
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 500;
    color: #6c757d;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    
    i {
      font-size: 1.1rem;
    }
    
    &:hover {
      background-color: #f8f9fa;
      color: #0d6efd;
    }
    
    &.active {
      color: #0d6efd;
      border-bottom: 2px solid #0d6efd;
      background-color: rgba(13, 110, 253, 0.05);
    }
  }
}

.tabs-content {
  padding: 1.5rem;
}

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
  margin-bottom: 1rem;
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

.booking-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  border-top: 1px solid #f1f1f1;
  padding-top: 1rem;
  
  .btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.85rem;
    padding: 0.35rem 0.75rem;
    
    i {
      font-size: 0.9rem;
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  max-width: 500px;
  width: 100%;
  margin: 0 1rem;
}

.modal-content {
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    i {
      color: #ffc107;
    }
  }
}

.modal-body {
  padding: 1.5rem;
  
  p {
    margin: 0;
    font-size: 1rem;
    color: #212529;
  }
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  
  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-weight: 500;
    
    i {
      font-size: 1rem;
    }
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1.5rem 1rem;
  }
  
  .profile-header h1 {
    font-size: 1.75rem;
  }
  
  .tabs-header .tab-btn {
    font-size: 0.9rem;
    padding: 0.75rem 0.5rem;
  }
  
  .booking-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .profile-header h1 {
    font-size: 1.5rem;
  }
  
  .tabs-header {
    flex-direction: column;
    
    .tab-btn {
      padding: 0.75rem;
      justify-content: flex-start;
      border-bottom: 1px solid #dee2e6;
      
      &.active {
        border-bottom: 2px solid #0d6efd;
      }
    }
  }
  
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