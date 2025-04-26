<template>
  <div class="calendar-page">
    <div class="calendar-header">
      <h1><i class="bi bi-calendar-week"></i> Календарь бронирований</h1>
      <div class="calendar-controls">
        <div class="search-filter">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по ресурсу..."
              class="form-control"
            />
          </div>
          <select v-model="selectedResource" class="form-select">
            <option value="">Все ресурсы</option>
            <option v-for="resource in resources" :key="resource.id" :value="resource.id">
              {{ resource.name }}
            </option>
          </select>
        </div>
        <div class="week-navigation">
          <button @click="prevWeek" class="btn btn-outline-primary">
            <i class="bi bi-chevron-left"></i>
          </button>
          <div class="week-range">{{ weekRange }}</div>
          <button @click="nextWeek" class="btn btn-outline-primary">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="calendar-wrapper">
      <div class="calendar-grid">
        <div class="calendar-header-row">
          <div class="time-column-header">Время</div>
          <div 
            v-for="day in days" 
            :key="day.date" 
            class="day-header"
          >
            <div class="day-name">{{ day.name }}</div>
            <div class="day-date">{{ formatDayDate(day.date) }}</div>
          </div>
        </div>

        <div 
          v-for="timeSlot in timeSlots" 
          :key="timeSlot" 
          class="calendar-row"
        >
          <div class="time-slot">{{ timeSlot }}</div>
          <div
            v-for="day in days"
            :key="day.date"
            :class="getCellClass(day.date, timeSlot)"
            @click="handleCellClick(day.date, timeSlot)"
            class="calendar-cell"
          >
            <div 
              v-for="booking in getBookingsForCell(day.date, timeSlot)" 
              :key="booking.id" 
              class="booking-card"
              :class="{
                'booking-confirmed': booking.isConfirmed && !booking.isExpired,
                'booking-pending': !booking.isConfirmed && !booking.isExpired,
                'booking-expired': booking.isExpired
              }"
            >
              <div class="booking-header">
                <span class="resource-name">{{ booking.resourceName }}</span>
                <span v-if="booking.isExpired" class="badge bg-danger">Истекло</span>
              </div>
              <div class="booking-user">{{ booking.userName || `Пользователь ${booking.userId}` }}</div>
              <div class="booking-time">
                {{ booking.time }} - {{ calculateEndTime(booking.time, booking.duration) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();

    const searchQuery = ref('');
    const selectedResource = ref('');
    const currentWeekStart = ref(getMonday(new Date()));
    const resources = computed(() => store.state.resources);
    const bookings = computed(() =>
      store.state.bookings.filter(
        (booking) => !booking.isCancelled
      )
    );
    const isBookingExpired = (booking) => {
      const bookingDate = new Date(`${booking.date}T${booking.time}`);
      return bookingDate < new Date();
    };

    const days = computed(() => {
      const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
      return daysOfWeek.map((day, index) => {
        const date = new Date(currentWeekStart.value);
        date.setDate(date.getDate() + index);
        return {
          name: day,
          date: formatDate(date)
        };
      });
    });

    const weekRange = computed(() => {
      const start = new Date(currentWeekStart.value);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;
    });

    const timeSlots = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 7;
      return `${String(hour).padStart(2, '0')}:00`;
    });

    const filteredBookings = computed(() => {
      const weekDates = days.value.map(day => day.date);
      return bookings.value.filter((booking) => {
        const resource = store.getters.getResourceNameById(booking.resourceId);
        const matchesSearch = resource.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesResource = selectedResource.value ? booking.resourceId === selectedResource.value : true;
        const matchesDate = weekDates.includes(booking.date);
        return matchesSearch && matchesResource && matchesDate;
      });
    });

    const getBookingsForCell = (date, timeSlot) => {
      return filteredBookings.value.filter((booking) => {
        if (booking.date !== date) return false;
        
        const bookingHour = parseInt(booking.time.split(':')[0]);
        const bookingEndHour = bookingHour + booking.duration;
        const cellHour = parseInt(timeSlot.split(':')[0]);
        
        return cellHour >= bookingHour && cellHour < bookingEndHour;
      }).map((booking) => ({
        ...booking,
        resourceName: store.getters.getResourceNameById(booking.resourceId),
        userName: store.getters.getUserNameById(booking.userId) || `Пользователь ${booking.userId}`,
        isExpired: isBookingExpired(booking)
      }));
    };

    const getCellClass = (date, timeSlot) => {
      const bookings = getBookingsForCell(date, timeSlot);
      if (bookings.length > 0) {
        if (bookings.some(b => b.isExpired)) return 'cell-expired';
        if (bookings.some(b => b.isConfirmed)) return 'cell-confirmed';
        return 'cell-pending';
      }
      return 'cell-available';
    };

    const handleCellClick = (date, timeSlot) => {
      console.log('Выбрана ячейка:', date, timeSlot);
    };

    const prevWeek = () => {
      const date = new Date(currentWeekStart.value);
      date.setDate(date.getDate() - 7);
      currentWeekStart.value = date;
    };

    const nextWeek = () => {
      const date = new Date(currentWeekStart.value);
      date.setDate(date.getDate() + 7);
      currentWeekStart.value = date;
    };

    function getMonday(date) {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    }

    function formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function formatDisplayDate(date) {
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }

    function formatDayDate(dateString) {
      const date = new Date(dateString);
      return date.getDate();
    }

    function calculateEndTime(startTime, duration) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + duration;
      return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    return {
      searchQuery,
      selectedResource,
      resources,
      days,
      timeSlots,
      weekRange,
      getBookingsForCell,
      getCellClass,
      handleCellClick,
      prevWeek,
      nextWeek,
      formatDayDate,
      calculateEndTime
    };
  },
};
</script>

<style lang="scss" scoped>
.calendar-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

.calendar-header {
  margin-bottom: 1.5rem;
  
  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #212529;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    i {
      font-size: 1.5rem;
      color: #0d6efd;
    }
  }
}

.calendar-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-filter {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  .input-group {
    width: auto;
    min-width: 250px;
    
    .input-group-text {
      background-color: #f8f9fa;
    }
  }
  
  .form-select {
    min-width: 200px;
  }
}

.week-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .week-range {
    font-weight: 500;
    min-width: 180px;
    text-align: center;
    font-size: 1.05rem;
  }
  
  .btn {
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.calendar-wrapper {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
  overflow: auto;
}

.calendar-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  min-width: 1000px;
}

.calendar-header-row {
  display: contents;
  
  .time-column-header,
  .day-header {
    padding: 0.75rem 0.5rem;
    background: #f8f9fa;
    font-weight: 500;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid #dee2e6;
  }
  
  .day-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    
    .day-name {
      font-size: 0.85rem;
      color: #6c757d;
    }
    
    .day-date {
      font-size: 1.1rem;
      color: #212529;
    }
  }
}

.calendar-row {
  display: contents;
  
  .time-slot {
    padding: 0.5rem;
    text-align: center;
    font-size: 0.85rem;
    color: #6c757d;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    position: sticky;
    left: 0;
    z-index: 5;
  }
  
  .calendar-cell {
    padding: 0.25rem;
    min-height: 80px;
    border-bottom: 1px solid #dee2e6;
    border-right: 1px solid #dee2e6;
    transition: background-color 0.15s ease;
    
    &:last-child {
      border-right: none;
    }
    
    &.cell-available {
      background-color: #f8f9fa;
      cursor: pointer;
      
      &:hover {
        background-color: #e9ecef;
      }
    }
    
    &.cell-confirmed {
      background-color: rgba(25, 135, 84, 0.05);
    }
    
    &.cell-pending {
      background-color: rgba(255, 193, 7, 0.05);
    }
    
    &.cell-expired {
      background-color: rgba(220, 53, 69, 0.05);
    }
  }
}

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

@media (max-width: 992px) {
  .calendar-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter {
    flex-direction: column;
    
    .input-group,
    .form-select {
      width: 100%;
    }
  }
  
  .week-navigation {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .calendar-page {
    padding: 1rem;
  }
  
  .calendar-header h1 {
    font-size: 1.5rem;
  }
  
  .booking-card {
    font-size: 0.7rem;
    
    .booking-user,
    .booking-time {
      font-size: 0.65rem;
    }
  }
}
</style>