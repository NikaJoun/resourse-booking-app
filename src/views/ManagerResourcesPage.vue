<template>
    <div class="manager-resources-container">
      <div class="manager-resources-card">
        <h1 class="manager-resources-title">Управление ресурсами</h1>

        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'resources' }"
              @click="activeTab = 'resources'"
            >
              Мои ресурсы
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'bookings' }"
              @click="activeTab = 'bookings'"
            >
              Подтверждение бронирований
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'allBookings' }"
              @click="activeTab = 'allBookings'"
            >
              Все бронирования
            </a>
          </li>
        </ul>

        <div v-if="activeTab === 'resources'" class="tab-content">
          <ul class="resource-list">
            <li v-for="resource in managedResources" :key="resource.id" class="resource-item">
              <div class="resource-info">
                <strong>Название:</strong> {{ resource.name }} <br />
                <strong>Тип:</strong> {{ resource.type }}
              </div>
            </li>
          </ul>
        </div>

        <div v-if="activeTab === 'bookings'" class="tab-content">
          <div v-if="pendingBookings.length > 0">
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
          <div v-else class="no-bookings-message">
            <p>Нет новых бронирований, которые нужно подтвердить.</p>
          </div>
        </div>

        <div v-if="activeTab === 'allBookings'" class="tab-content">
          <div v-if="allBookings.length > 0">
            <ul class="booking-list">
              <li v-for="booking in allBookings" :key="booking.id" class="booking-item">
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
          </div>
          <div v-else class="no-bookings-message">
            <p>Нет бронирований для отображения.</p>
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

      const activeTab = ref('resources');

      const managedResources = computed(() => store.getters.managedResources);

      const pendingBookings = computed(() => {
        const managedResourceIds = managedResources.value.map((resource) => resource.id);
        return store.state.bookings.filter(
          (booking) =>
            managedResourceIds.includes(booking.resourceId) && !booking.isConfirmed
        );
      });

      const allBookings = computed(() => {
        const managedResourceIds = managedResources.value.map((resource) => resource.id);
        return store.state.bookings.filter((booking) =>
          managedResourceIds.includes(booking.resourceId)
        );
      });

      const getResourceName = (resourceId) => {
        return store.getters.getResourceNameById(resourceId);
      };

      const confirmBooking = (bookingId) => {
        store.commit('CONFIRM_BOOKING', bookingId);
      };
  
      const rejectBooking = (bookingId) => {
        store.commit('REMOVE_BOOKING', bookingId);
      };

      const getStatusClass = (booking) => {
        if (booking.isCompleted) return 'text-success';
        if (booking.isCancelled) return 'text-danger';
        return booking.isConfirmed ? 'text-success' : 'text-warning';
      };

      const getStatusText = (booking) => {
        if (booking.isCompleted) return 'Завершено';
        if (booking.isCancelled) return 'Отменено';
        return booking.isConfirmed ? 'Подтверждено' : 'Ожидает подтверждения';
      };
  
      return {
        activeTab,
        managedResources,
        pendingBookings,
        allBookings,
        getResourceName,
        confirmBooking,
        rejectBooking,
        getStatusClass,
        getStatusText,
      };
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .manager-resources-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 1rem;
  }
  
  .manager-resources-card {
    background: #ffffff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    width: 100%;
  }
  
  .manager-resources-title {
    font-size: 2rem;
    font-weight: 700;
    color: #343a40;
    text-align: center;
    margin-bottom: 1.5rem;
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
  
  .resource-list,
  .booking-list {
    list-style: none;
    padding: 0;
  }
  
  .resource-item,
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
  
  .resource-info,
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
  
  .btn-danger {
    background-color: #dc3545;
    color: white;
  }
  
  .btn-success {
    background-color: #28a745;
    color: white;
  }
  
  .text-success {
    color: green;
  }
  
  .text-warning {
    color: orange;
  }
  
  .text-danger {
    color: red;
  }
  
  .no-bookings-message {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
    font-size: 1.1rem;
  }
  </style>