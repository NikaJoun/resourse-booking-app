<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1><i class="bi bi-gear"></i> Управление ресурсами</h1>
    </div>

    <div class="admin-content">
      <div class="admin-tabs">
        <div class="tabs-header">
          <button 
            @click="activeTab = 'resources'" 
            :class="['tab-btn', { active: activeTab === 'resources' }]"
          >
            <i class="bi bi-collection"></i> Мои ресурсы
          </button>
          <button 
            @click="activeTab = 'bookings'" 
            :class="['tab-btn', { active: activeTab === 'bookings' }]"
          >
            <i class="bi bi-clock-history"></i> Подтверждение бронирований
          </button>
          <button 
            @click="activeTab = 'allBookings'" 
            :class="['tab-btn', { active: activeTab === 'allBookings' }]"
          >
            <i class="bi bi-calendar-check"></i> Все бронирования
          </button>
        </div>

        <div class="tabs-content">
          <div v-if="activeTab === 'resources'" class="tab-pane">
            <div v-if="managedResources.length === 0" class="empty-state">
              <i class="bi bi-collection"></i>
              <p>У вас нет управляемых ресурсов</p>
            </div>

            <div v-else class="admin-cards">
              <div v-for="resource in managedResources" :key="resource.id" class="admin-card">
                <div class="card-header">
                  <div class="resource-icon" :class="resource.type">
                    <i :class="getResourceIcon(resource.type)"></i>
                  </div>
                  <div class="resource-title">
                    <h3>{{ resource.name }}</h3>
                    <span class="resource-type">
                      {{ formatResourceType(resource.type) }}
                    </span>
                  </div>
                </div>
                
                <div class="card-body">
                  <div class="info-row">
                    <i class="bi bi-info-circle"></i>
                    <span>ID: {{ resource.id }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'bookings'" class="tab-pane">
            <div v-if="pendingBookings.length === 0" class="empty-state">
              <i class="bi bi-check-circle"></i>
              <p>Нет новых бронирований для подтверждения</p>
            </div>

            <div v-else class="admin-cards">
              <div v-for="booking in pendingBookings" :key="booking.id" class="admin-card">
                <div class="card-header">
                  <div class="resource-icon">
                    <i class="bi bi-calendar-plus"></i>
                  </div>
                  <div class="resource-title">
                    <h3>Бронирование #{{ booking.id }}</h3>
                    <span class="resource-type">
                      {{ formatDate(booking.date) }} в {{ booking.time }}
                    </span>
                  </div>
                </div>
                
                <div class="card-body">
                  <div class="info-row">
                    <i class="bi bi-collection"></i>
                    <span>Ресурс: {{ getResourceName(booking.resourceId) }}</span>
                  </div>
                  <div class="info-row">
                    <i class="bi bi-person"></i>
                    <span>Пользователь: {{ getUserName(booking.userId) }}</span>
                  </div>
                  <div class="info-row">
                    <i class="bi bi-clock"></i>
                    <span>Продолжительность: {{ booking.duration }} час(ов)</span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <button 
                    @click="confirmBooking(booking.id)" 
                    class="btn btn-sm btn-success"
                  >
                    <i class="bi bi-check-lg"></i> Подтвердить
                  </button>
                  <button 
                    @click="rejectBooking(booking.id)" 
                    class="btn btn-sm btn-outline-danger"
                  >
                    <i class="bi bi-x-lg"></i> Отклонить
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'allBookings'" class="tab-pane">
            <div class="admin-filters">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <select class="form-select" v-model="selectedResourceFilter">
                  <option value="">Все ресурсы</option>
                  <option v-for="resource in managedResources" :key="resource.id" :value="resource.id">
                    {{ resource.name }}
                  </option>
                </select>
              </div>
              
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-calendar"></i></span>
                <input 
                  type="date" 
                  class="form-control" 
                  v-model="dateFrom"
                  placeholder="Дата с"
                >
              </div>
              
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-calendar"></i></span>
                <input 
                  type="date" 
                  class="form-control" 
                  v-model="dateTo"
                  placeholder="Дата по"
                >
              </div>
              
              <select class="form-select" v-model="selectedStatusFilter">
                <option value="">Все статусы</option>
                <option value="pending">Ожидает подтверждения</option>
                <option value="confirmed">Подтверждено</option>
                <option value="completed">Завершено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>

            <div v-if="filteredAllBookings.length === 0" class="empty-state">
              <i class="bi bi-calendar-x"></i>
              <p>Бронирования не найдены</p>
            </div>

            <div v-else class="admin-cards">
              <div v-for="booking in filteredAllBookings" :key="booking.id" class="admin-card">
                <div class="card-header">
                  <div class="resource-icon" :class="getBookingStatusClass(booking)">
                    <i :class="getBookingIcon(booking)"></i>
                  </div>
                  <div class="resource-title">
                    <h3>Бронирование #{{ booking.id }}</h3>
                    <span class="resource-type">
                      {{ formatDate(booking.date) }} в {{ booking.time }}
                    </span>
                  </div>
                </div>
                
                <div class="card-body">
                  <div class="info-row">
                    <i class="bi bi-collection"></i>
                    <span>Ресурс: {{ getResourceName(booking.resourceId) }}</span>
                  </div>
                  <div class="info-row">
                    <i class="bi bi-person"></i>
                    <span>Пользователь: {{ getUserName(booking.userId) }}</span>
                  </div>
                  <div class="info-row">
                    <i class="bi bi-clock"></i>
                    <span>Продолжительность: {{ booking.duration }} час(ов)</span>
                  </div>
                  <div class="info-row">
                    <i class="bi bi-info-circle"></i>
                    <span>Статус: 
                      <span :class="getStatusTextClass(booking)">
                        {{ getStatusText(booking) }}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';

export default {
  setup() {
    const store = useStore();
    const toast = useToast();
    const activeTab = ref('resources');

    onMounted(() => {
      console.log('Store state:', store.state);
      console.log('Managed resources:', store.getters['resources/managedResources']);
      console.log('Pending bookings:', store.getters['bookings/pendingBookings']);
    });

    const selectedResourceFilter = ref('');
    const dateFrom = ref('');
    const dateTo = ref('');
    const selectedStatusFilter = ref('');

    const managedResources = computed(() => {
      if (!store.getters['auth/isResourceManager']) return [];
      return store.state.resources.resources.filter(
        r => r.managerId === store.getters['auth/currentUser'].id
      );
    });
        const pendingBookings = computed(() => {
      if (!store.getters['auth/isResourceManager']) return [];
      return store.getters['bookings/pendingBookings'];
    });
    
    const allBookings = computed(() => {
      const resources = managedResources.value || [];
      const managedResourceIds = resources.map((resource) => resource.id);
      const bookings = store.state.bookings?.bookings || [];
      return bookings.filter((booking) =>
        managedResourceIds.includes(booking.resourceId)
      );
    });
    
    const getUserName = (userId) => {
      const users = store.state.users?.users || [];
      const user = users.find(u => u.id === userId);
      return user ? user.username : 'Неизвестный пользователь';
    };

    const filteredAllBookings = computed(() => {
      const bookings = allBookings.value || [];
      return bookings.filter(booking => {
        if (selectedResourceFilter.value && booking.resourceId !== selectedResourceFilter.value) {
          return false;
        }
        
        if (dateFrom.value && booking.date < dateFrom.value) {
          return false;
        }
        if (dateTo.value && booking.date > dateTo.value) {
          return false;
        }

        if (selectedStatusFilter.value) {
          const isCompleted = store.getters['bookings/isBookingCompleted']?.(booking) || false;
          
          if (selectedStatusFilter.value === 'pending' && booking.isConfirmed) {
            return false;
          }
          if (selectedStatusFilter.value === 'confirmed' && (!booking.isConfirmed || booking.isCancelled || isCompleted)) {
            return false;
          }
          if (selectedStatusFilter.value === 'completed' && !isCompleted) {
            return false;
          }
          if (selectedStatusFilter.value === 'cancelled' && !booking.isCancelled) {
            return false;
          }
        }
        
        return true;
      });
    });

    const getResourceName = (resourceId) => {
      const resources = store.state.resources?.resources || [];
      const resource = resources.find(r => r.id === resourceId);
      return resource ? resource.name : 'Неизвестный ресурс';
    };

    const getResourceIcon = (type) => {
      switch(type) {
        case 'photographer': return 'bi bi-camera';
        case 'conference_room': return 'bi bi-building';
        case 'equipment': return 'bi bi-pc-display';
        default: return 'bi bi-collection';
      }
    };

    const formatResourceType = (type) => {
      switch(type) {
        case 'photographer': return 'Фотограф';
        case 'conference_room': return 'Конференц-зал';
        case 'equipment': return 'Оборудование';
        default: return type;
      }
    };

    const confirmBooking = async (bookingId) => {
      try {
        await store.dispatch('bookings/confirmBooking', bookingId);
        toast.success('Бронирование подтверждено');
      } catch (error) {
        toast.error('Ошибка при подтверждении бронирования');
        console.error(error);
      }
    };

    const rejectBooking = async (bookingId) => {
      try {
        await store.dispatch('bookings/cancelBooking', bookingId);
        toast.success('Бронирование отклонено');
      } catch (error) {
        toast.error('Ошибка при отклонении бронирования');
        console.error(error);
      }
    };

    const getStatusTextClass = (booking) => {
      if (!booking) return '';
      const isCompleted = store.getters['bookings/isBookingCompleted']?.(booking) || false;
      if (isCompleted) return 'text-success';
      if (booking.isCancelled) return 'text-danger';
      return booking.isConfirmed ? 'text-success' : 'text-warning';
    };

    const getBookingStatusClass = (booking) => {
      if (!booking) return '';
      const isCompleted = store.getters['bookings/isBookingCompleted']?.(booking) || false;
      if (isCompleted) return 'completed';
      if (booking.isCancelled) return 'cancelled';
      return booking.isConfirmed ? 'confirmed' : 'pending';
    };

    const getBookingIcon = (booking) => {
      if (!booking) return 'bi bi-question-circle';
      const isCompleted = store.getters['bookings/isBookingCompleted']?.(booking) || false;
      if (isCompleted) return 'bi bi-check-circle';
      if (booking.isCancelled) return 'bi bi-x-circle';
      return booking.isConfirmed ? 'bi bi-check-circle' : 'bi bi-clock';
    };

    const getStatusText = (booking) => {
      if (!booking) return 'Неизвестный статус';
      const isCompleted = store.getters['bookings/isBookingCompleted']?.(booking) || false;
      if (isCompleted) return 'Завершено';
      if (booking.isCancelled) return 'Отменено';
      return booking.isConfirmed ? 'Подтверждено' : 'Ожидает подтверждения';
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
      } catch {
        return dateString;
      }
    };

    return {
      activeTab,
      managedResources,
      pendingBookings,
      allBookings,
      filteredAllBookings,
      selectedResourceFilter,
      dateFrom,
      dateTo,
      selectedStatusFilter,
      getResourceName,
      getResourceIcon,
      formatResourceType,
      confirmBooking,
      rejectBooking,
      getStatusTextClass,
      getBookingStatusClass,
      getBookingIcon,
      getStatusText,
      formatDate,
      getUserName,
    };
  },
};
</script>

<style lang="scss" scoped>
.admin-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.admin-header {
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #212529;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    i {
      color: #0d6efd;
    }
  }
}

.admin-tabs {
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

.admin-filters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .input-group {
    display: flex;
    align-items: center;
    
    .input-group-text {
      padding: 0.5rem 0.75rem;
      background-color: #f8f9fa;
      border: 1px solid #ced4da;
      border-right: none;
      border-radius: 0.25rem 0 0 0.25rem;
    }
    
    .form-control, .form-select {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 0 0.25rem 0.25rem 0;
    }
  }
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

.admin-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.admin-card {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1.25rem;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  .resource-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #6c757d;
    
    &.photographer {
      background: rgba(13, 110, 253, 0.1);
      color: #0d6efd;
    }
    
    &.conference_room {
      background: rgba(25, 135, 84, 0.1);
      color: #198754;
    }
    
    &.equipment {
      background: rgba(108, 117, 125, 0.1);
      color: #6c757d;
    }
    
    &.pending {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }
    
    &.confirmed {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
    }
    
    &.completed {
      background: rgba(13, 110, 253, 0.1);
      color: #0d6efd;
    }
    
    &.cancelled {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }
  }
  
  .resource-title {
    flex: 1;
    
    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      color: #212529;
    }
    
    .resource-type {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      display: inline-block;
      background: #f8f9fa;
      color: #6c757d;
    }
  }
}

.card-body {
  margin-bottom: 1rem;
  
  .info-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
    
    i {
      font-size: 0.9rem;
    }
  }
}

.card-actions {
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

.text-success {
  color: #28a745;
}

.text-warning {
  color: #ffc107;
}

.text-danger {
  color: #dc3545;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
  
  &:hover {
    background-color: #218838;
    border-color: #1e7e34;
  }
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
  
  &:hover {
    background-color: #dc3545;
    color: white;
  }
}

@media (max-width: 992px) {
  .admin-filters {
    grid-template-columns: 1fr 1fr;
  }
  
  .admin-cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .admin-page {
    padding: 1.5rem 1rem;
  }
  
  .tabs-header .tab-btn {
    font-size: 0.9rem;
    padding: 0.75rem 0.5rem;
  }
  
  .admin-filters {
    grid-template-columns: 1fr;
  }
  
  .admin-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .admin-header h1 {
    font-size: 1.75rem;
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
}
</style>