<template>
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
        <CalendarCell
            v-for="day in days"
            :key="day.date"
            :date="day.date"
            :timeSlot="timeSlot"
            :bookings="getBookingsForCell(day.date, timeSlot)"
            @cell-click="$emit('cell-click', day.date, timeSlot)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { formatDayDate, isBookingExpired } from '@/utils/dateUtils';
import CalendarCell from './CalendarCell.vue';

export default {
  name: 'CalendarGrid',
  components: {
    CalendarCell
  },
  props: {
    days: Array,
    timeSlots: Array,
    filteredBookings: Array
  },
  emits: ['cell-click'],
  methods: {
    formatDayDate,
    getBookingsForCell(date, timeSlot) {
      return this.filteredBookings.filter((booking) => {
        if (booking.date !== date) return false;
        
        const bookingHour = parseInt(booking.time.split(':')[0]);
        const bookingEndHour = bookingHour + booking.duration;
        const cellHour = parseInt(timeSlot.split(':')[0]);
        
        return cellHour >= bookingHour && cellHour < bookingEndHour;
      }).map(booking => ({
        ...booking,
        resourceName: this.$store.getters['resources/getResourceNameById'](booking.resourceId),
        isExpired: isBookingExpired(booking)
      }));
    }
  }
};
</script>

<style scoped>
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
}
</style>