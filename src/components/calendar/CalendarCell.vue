<template>
  <div
    :class="cellClass"
    @click="$emit('cell-click')"
    class="calendar-cell"
  >
    <BookingCard
      v-for="booking in bookings"
      :key="booking.id"
      :booking="booking"
    />
  </div>
</template>

<script>
import BookingCard from './BookingCard.vue';

export default {
  name: 'CalendarCell',
  components: {
    BookingCard
  },
  props: {
    date: String,
    timeSlot: String,
    bookings: Array
  },
  computed: {
    cellClass() {
      if (this.bookings.length === 0) return 'cell-available';
      if (this.bookings.some(b => b.isExpired)) return 'cell-expired';
      if (this.bookings.some(b => b.isConfirmed)) return 'cell-confirmed';
      return 'cell-pending';
    }
  },
  emits: ['cell-click']
};
</script>

<style scoped>
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
</style>