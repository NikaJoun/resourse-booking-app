<template>
  <div class="profile-container">
    <div class="profile-card">
      <h1 class="profile-title">Профиль</h1>

      <div v-if="store.state.currentUser" class="user-info">
        <h2>Добро пожаловать, {{ store.state.currentUser.username }}!</h2>
        <button @click="showSyncModal = true" class="btn btn-primary sync-btn">
          <i class="bi bi-calendar-plus"></i> Синхронизировать все бронирования
        </button>
      </div>

      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'active' }"
            @click="activeTab = 'active'"
          >
            Активные бронирования
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            История бронирований
          </a>
        </li>
      </ul>

      <div v-if="activeTab === 'active'" class="tab-content">
        <ul class="booking-list">
          <li v-for="booking in activeBookings" :key="booking.id" class="booking-item">
            <div class="booking-info">
              <strong>Дата:</strong> {{ booking.date }} <br />
              <strong>Время:</strong> {{ booking.time }} <br />
              <strong>Ресурс:</strong> {{ getResourceName(booking.resourceId) }} <br />
              <strong>Продолжительность:</strong> {{ booking.duration }} час(ов) <br />
              <strong>Статус:</strong>
              <span :class="booking.isConfirmed ? 'text-success' : 'text-warning'">
                {{ booking.isConfirmed ? 'Подтверждено' : 'Ожидает подтверждения' }}
              </span>
            </div>
            <div class="booking-actions">
              <button @click="openCancelModal(booking.id)" class="btn btn-warning">Отменить</button>
              <button @click="exportSingleBooking(booking)" class="btn btn-outline-primary">
                <i class="bi bi-calendar-plus"></i> Экспорт
              </button>
            </div>
          </li>
        </ul>
        <div v-if="activeBookings.length === 0" class="no-bookings-message">
          <p>Нет активных бронирований.</p>
        </div>
      </div>

      <div v-if="activeTab === 'history'" class="tab-content">
        <ul class="booking-list">
          <li v-for="booking in bookingHistory" :key="booking.id" class="booking-item">
            <div class="booking-info">
              <strong>Дата:</strong> {{ booking.date }} <br />
              <strong>Время:</strong> {{ booking.time }} <br />
              <strong>Ресурс:</strong> {{ getResourceName(booking.resourceId) }} <br />
              <strong>Продолжительность:</strong> {{ booking.duration }} час(ов) <br />
              <strong>Статус:</strong>
              <span :class="getStatusClass(booking)">
                {{ getStatusText(booking) }}
              </span>
            </div>
            <div class="booking-actions">
              <button @click="exportSingleBooking(booking)" class="btn btn-outline-primary">
                <i class="bi bi-calendar-plus"></i> Экспорт
              </button>
            </div>
          </li>
        </ul>
        <div v-if="bookingHistory.length === 0" class="no-bookings-message">
          <p>Нет завершенных бронирований.</p>
        </div>
      </div>
    </div>

    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Подтверждение отмены</h3>
        <p>Вы уверены, что хотите отменить это бронирование?</p>
        <div class="modal-actions">
          <button @click="confirmCancel" class="btn btn-danger">Подтвердить</button>
          <button @click="closeCancelModal" class="btn btn-secondary">Отмена</button>
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
    const lastExportDate = computed(() => store.getters.lastExportDate);

    const getResourceName = (resourceId) => {
      return store.getters.getResourceNameById(resourceId);
    };

    const getStatusClass = (booking) => {
      if (booking.isCompleted) return 'text-success';
      if (booking.isCancelled) return 'text-danger';
      if (store.getters.isBookingCompleted(booking)) return 'text-secondary';
      return 'text-warning';
    };

    const getStatusText = (booking) => {
      if (booking.isCompleted) return 'Завершено';
      if (booking.isCancelled) return 'Отменено';
      if (store.getters.isBookingCompleted(booking)) return 'Истекло';
      return booking.isConfirmed ? 'Подтверждено' : 'Ожидает подтверждения';
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
      lastExportDate,
      getResourceName,
      getStatusClass,
      getStatusText,
      showCancelModal,
      showSyncModal,
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
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.profile-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
}

.profile-title {
  font-size: 2rem;
  font-weight: 700;
  color: #343a40;
  text-align: center;
  margin-bottom: 1.5rem;
}

.user-info {
  text-align: center;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #495057;
  }
}

.sync-btn {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.sync-status {
  margin-top: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.nav-tabs {
  border-bottom: 2px solid #dee2e6;

  .nav-link {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px 8px 0 0;
    font-size: 1rem;
    font-weight: 500;
    color: #495057;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      background-color: #f8f9fa;
    }

    &.active {
      color: #007bff;
      border-bottom: 2px solid #007bff;
      background-color: transparent;
    }
  }
}

.booking-list {
  list-style: none;
  padding: 0;
}

.booking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #f8f9fa;
}

.booking-info {
  flex: 1;

  strong {
    color: #343a40;
  }
}

.booking-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    opacity: 0.9;
  }
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-outline-primary {
  background-color: transparent;
  border: 1px solid #007bff;
  color: #007bff;

  &:hover {
    background-color: #007bff;
    color: white;
  }
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.text-success {
  color: #28a745;
}

.text-warning {
  color: #ffc107;
}

.text-danger {
  color: #dc3545;
}

.text-secondary {
  color: #6c757d;
}

.no-bookings-message {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-size: 1.1rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
  text-align: center;

  h3 {
    margin-bottom: 1rem;
  }

  .modal-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }
}
</style>