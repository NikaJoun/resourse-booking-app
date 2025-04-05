<template>
  <div class="calendar-page">
    <div class="filters">
      <h1>Календарь бронирований</h1>
      <div class="filter-controls">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по ресурсу..."
          class="search-input"
        />
        <select v-model="selectedResource" class="resource-select">
          <option value="">Все ресурсы</option>
          <option v-for="resource in resources" :key="resource.id" :value="resource.id">
            {{ resource.name }}
          </option>
        </select>
        <div class="week-navigation">
          <button @click="prevWeek" class="nav-button">&lt;</button>
          <span class="week-range">{{ weekRange }}</span>
          <button @click="nextWeek" class="nav-button">&gt;</button>
        </div>
      </div>
    </div>

    <div class="calendar-container">
      <div class="calendar">
        <table>
          <thead>
            <tr>
              <th>Время</th>
              <th v-for="day in days" :key="day.date">{{ day.name }}<br>{{ day.date }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="timeSlot in timeSlots" :key="timeSlot">
              <td class="time-slot">{{ timeSlot }}</td>
              <td
                v-for="day in days"
                :key="day.date"
                :class="getCellClass(day.date, timeSlot)"
                @click="handleCellClick(day.date, timeSlot)"
              >
                <div 
                  v-for="booking in getBookingsForCell(day.date, timeSlot)" 
                  :key="booking.id" 
                  class="booking"
                  :class="{
                    confirmed: booking.isConfirmed && !booking.isExpired,
                    pending: !booking.isConfirmed && !booking.isExpired,
                    expired: booking.isExpired
                  }"
                >
                  <span class="user-name">{{ booking.userName || `Пользователь ${booking.userId}` }}</span>
                  <span class="resource-name">{{ booking.resourceName }}</span>
                  <span v-if="booking.isExpired" class="expired-badge">Истекло</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
      return `${formatDate(start)} - ${formatDate(end)}`;
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
        if (bookings.some(b => b.isExpired)) return 'expired';
        if (bookings.some(b => b.isConfirmed)) return 'confirmed';
        return 'pending';
      }
      return 'available';
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
      nextWeek
    };
  },
};
</script>

<style lang="scss" scoped>
.calendar-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
}

.filters {
  margin-bottom: 20px;
  
  h1 {
    font-size: 24px;
    margin-bottom: 15px;
    color: #333;
  }
  
  .filter-controls {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    
    .search-input,
    .resource-select {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      min-width: 200px;
    }
    
    .week-navigation {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: auto;
      
      .nav-button {
        padding: 8px 12px;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        
        &:hover {
          background-color: #e9ecef;
        }
      }
      
      .week-range {
        font-weight: 500;
        min-width: 180px;
        text-align: center;
      }
    }
  }
}

.calendar-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.calendar {
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      border: 1px solid #e0e0e0;
      padding: 8px;
      text-align: center;
    }
    
    th {
      background-color: #f8f9fa;
      font-weight: 500;
      color: #555;
    }
    
    td {
      height: 60px;
      vertical-align: top;
      transition: background-color 0.2s;
      
      &.time-slot {
        font-weight: 500;
        background-color: #f8f9fa;
      }
      
      &.available {
        background-color: #f8f9fa;
        cursor: pointer;
        
        &:hover {
          background-color: #e9ecef;
        }
      }
      
      &.confirmed {
        background-color: #d4edda;
      }
      
      &.pending {
        background-color: #fff3cd;
      }
      
      &.expired {
        background-color: #f8d7da;
      }
    }
  }
}

.booking {
  margin: 2px;
  padding: 5px;
  border-radius: 3px;
  font-size: 12px;
  text-align: left;
  
  .user-name {
    display: block;
    font-weight: 500;
    color: #333;
  }
  
  .resource-name {
    display: block;
    font-size: 11px;
    color: #666;
  }
  
  .expired-badge {
    display: block;
    font-size: 10px;
    color: #dc3545;
    font-style: italic;
  }
  
  &.confirmed {
    background-color: rgba(40, 167, 69, 0.1);
    border-left: 2px solid #28a745;
  }
  
  &.pending {
    background-color: rgba(255, 193, 7, 0.1);
    border-left: 2px solid #ffc107;
  }
  
  &.expired {
    background-color: rgba(220, 53, 69, 0.1);
    border-left: 2px solid #dc3545;
  }
}

@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
    
    > * {
      width: 100%;
    }
    
    .week-navigation {
      margin-left: 0;
      margin-top: 10px;
      justify-content: center;
    }
  }
  
  .calendar {
    table {
      td {
        height: 50px;
        font-size: 12px;
      }
    }
  }
  
  .booking {
    padding: 3px;
    
    .user-name {
      font-size: 11px;
    }
    
    .resource-name {
      font-size: 10px;
    }
  }
}
</style>