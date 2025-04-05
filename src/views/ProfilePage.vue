<template>
  <div class="profile-container">
    <div class="profile-card">
      <h1 class="profile-title">Профиль</h1>

      <div v-if="store.state.currentUser" class="user-info">
        <h2>Добро пожаловать, {{ store.state.currentUser.username }}!</h2>
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
            <button @click="openCancelModal(booking.id)" class="btn btn-warning">Отменить</button>
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
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();

    const activeTab = ref('active');
    const showCancelModal = ref(false);
    const selectedBookingId = ref(null);

    const isBookingExpired = (booking) => {
      const bookingDate = new Date(`${booking.date}T${booking.time}`);
      return bookingDate < new Date();
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
        store.commit('CANCEL_BOOKING', selectedBookingId.value);
      }
      closeCancelModal();
    };

    const activeBookings = computed(() => {
      if (!store.state.currentUser) return [];
      return store.state.bookings.filter(
        (booking) =>
          booking.userId === store.state.currentUser.id &&
          !booking.isCancelled &&
          !booking.isCompleted &&
          !isBookingExpired(booking)
      );
    });

    const bookingHistory = computed(() => {
      if (!store.state.currentUser) return [];
      return store.state.bookings.filter(
        (booking) =>
          booking.userId === store.state.currentUser.id &&
          (booking.isCancelled || booking.isCompleted || isBookingExpired(booking))
      );
    });

    const getResourceName = (resourceId) => {
      return store.getters.getResourceNameById(resourceId);
    };

    const getStatusClass = (booking) => {
      if (booking.isCompleted) return 'text-success';
      if (booking.isCancelled) return 'text-danger';
      if (isBookingExpired(booking)) return 'text-secondary';
      return 'text-warning';
    };

    const getStatusText = (booking) => {
      if (booking.isCompleted) return 'Завершено';
      if (booking.isCancelled) return 'Отменено';
      if (isBookingExpired(booking)) return 'Истекло';
      return 'Ожидает подтверждения';
    };

    return {
      store,
      activeTab,
      activeBookings,
      bookingHistory,
      getResourceName,
      getStatusClass,
      getStatusText,
      showCancelModal,
      openCancelModal,
      closeCancelModal,
      confirmCancel,
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

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
}

.btn-warning {
  background-color: #ffc107;
  color: black;
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