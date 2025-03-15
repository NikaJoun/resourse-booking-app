<template>
  <div class="profile-container">
    <div class="profile-card">
      <h1 class="profile-title">Профиль</h1>

      <!-- Имя пользователя -->
      <div v-if="store.state.currentUser" class="user-info">
        <h2>Добро пожаловать, {{ store.state.currentUser.username }}!</h2>
      </div>

      <!-- Кнопка для открытия истории бронирований -->
      <button
        type="button"
        class="btn btn-primary mb-4"
        data-bs-toggle="modal"
        data-bs-target="#bookingHistoryModal"
      >
        История бронирований
      </button>

      <!-- Модальное окно для истории бронирований -->
      <div
        class="modal fade"
        id="bookingHistoryModal"
        tabindex="-1"
        aria-labelledby="bookingHistoryModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="bookingHistoryModalLabel">История бронирований</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <ul class="booking-history-list">
                <li
                  v-for="booking in bookingHistory"
                  :key="booking.id"
                  class="booking-history-item"
                >
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
                </li>
              </ul>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Бронирования пользователя -->
      <h2>Мои бронирования</h2>
      <ul class="booking-list">
        <li v-for="booking in userBookings" :key="booking.id" class="booking-item">
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
          <button @click="cancelBooking(booking.id)" class="btn btn-warning">Отменить</button>
        </li>
      </ul>

      <!-- Управление ресурсами (для менеджеров) -->
      <div v-if="store.getters.isResourceManager">
        <h2>Управление ресурсами</h2>

        <!-- Список ресурсов, за которые отвечает менеджер -->
        <ul class="resource-list">
          <li v-for="resource in managedResources" :key="resource.id" class="resource-item">
            <div class="resource-info">
              <strong>Название:</strong> {{ resource.name }} <br />
              <strong>Тип:</strong> {{ resource.type }}
            </div>
            <button @click="editResource(resource)" class="btn btn-secondary">Редактировать</button>
            <button @click="removeResource(resource.id)" class="btn btn-danger">Удалить</button>
          </li>
        </ul>

        <!-- Подтверждение бронирований -->
        <h2>Подтверждение бронирований</h2>
        <ul class="booking-list">
          <li v-for="booking in pendingBookings" :key="booking.id" class="booking-item">
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
            <button @click="confirmBooking(booking.id)" class="btn btn-success">Подтвердить</button>
            <button @click="rejectBooking(booking.id)" class="btn btn-danger">Отклонить</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      showHistoryModal: false,
    };
  },
  computed: {
    bookingHistory() {
      if (!this.$store.state.currentUser) return [];

      if (this.$store.state.currentUser.role === 'user') {
        // Для пользователя: все его бронирования
        return this.$store.state.bookings.filter(
          (booking) => booking.userId === this.$store.state.currentUser.id
        );
      } else if (this.$store.state.currentUser.role === 'manager') {
        // Для менеджера: бронирования по его ответственному типу
        const managedResourceIds = this.$store.getters.managedResources.map(
          (resource) => resource.id
        );
        return this.$store.state.bookings.filter((booking) =>
          managedResourceIds.includes(booking.resourceId)
        );
      }

      return [];
    },
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    // Бронирования текущего пользователя
    const userBookings = computed(() => {
      if (!store.state.currentUser) return [];
      return store.state.bookings.filter(
        (booking) => booking.userId === store.state.currentUser.id
      );
    });

    // Ресурсы, за которые отвечает текущий менеджер
    const managedResources = computed(() => store.getters.managedResources);

    // Бронирования, ожидающие подтверждения
    const pendingBookings = computed(() => {
      if (!store.state.currentUser || store.state.currentUser.role !== 'manager') return [];
      const managedResourceIds = managedResources.value.map((resource) => resource.id);
      return store.state.bookings.filter(
        (booking) =>
          managedResourceIds.includes(booking.resourceId) && !booking.isConfirmed
      );
    });

    // Название ресурса по ID
    const getResourceName = (resourceId) => {
      return store.getters.getResourceNameById(resourceId);
    };

    // Редактирование ресурса
    const editResource = (resource) => {
      const newName = prompt('Введите новое название:', resource.name);
      if (newName) {
        const updatedResource = { ...resource, name: newName };
        store.dispatch('updateResource', updatedResource);
      }
    };

    // Удаление ресурса
    const removeResource = (resourceId) => {
      if (confirm('Вы уверены, что хотите удалить этот ресурс?')) {
        store.dispatch('removeResource', resourceId);
      }
    };

    // Подтверждение бронирования
    const confirmBooking = (bookingId) => {
      store.commit('CONFIRM_BOOKING', bookingId);
    };

    // Отклонение бронирования
    const rejectBooking = (bookingId) => {
      store.commit('REMOVE_BOOKING', bookingId);
    };

    // Отмена бронирования
    const cancelBooking = (bookingId) => {
      store.commit('REMOVE_BOOKING', bookingId);
    };

    // Выход из системы
    const logout = () => {
      store.dispatch('logout');
      router.push('/');
    };

    return {
      store,
      userBookings,
      managedResources,
      pendingBookings,
      getResourceName,
      editResource,
      removeResource,
      confirmBooking,
      rejectBooking,
      cancelBooking,
      logout,
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

.booking-list,
.resource-list {
  list-style: none;
  padding: 0;
}

.booking-item,
.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #f8f9fa;
}

.booking-info,
.resource-info {
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

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.text-success {
  color: green;
}

.text-warning {
  color: orange;
}

.booking-history-list {
  list-style: none;
  padding: 0;
}

.booking-history-item {
  padding: 1rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #f8f9fa;
}
</style>