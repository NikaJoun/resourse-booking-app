<template>
  <div class="calendar-page">
    <CalendarHeader />
    <CalendarControls 
      :search-query="searchQuery"
      :selected-resource="selectedResource"
      :week-range="weekRange"
      :resources="resources"
      @update:searchQuery="val => searchQuery = val"
      @update:selectedResource="val => selectedResource = val"
      @prev-week="prevWeek"
      @next-week="nextWeek"
    />
    <CalendarGrid 
      :days="days"
      :timeSlots="timeSlots"
      :filteredBookings="filteredBookings"
      @cell-click="handleCellClick"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { getMonday, formatDate, formatDisplayDate, isBookingExpired } from '@/utils/dateUtils';
import CalendarHeader from '@/components/calendar/CalendarHeader.vue';
import CalendarControls from '@/components/calendar/CalendarControls.vue';
import CalendarGrid from '@/components/calendar/CalendarGrid.vue';

export default {
  components: {
    CalendarHeader,
    CalendarControls,
    CalendarGrid
  },
  setup() {
    const store = useStore();

    onMounted(async () => {
      await store.dispatch('users/fetchUsers');
      await store.dispatch('resources/fetchResources');
      await store.dispatch('bookings/fetchBookings');
    });
    
    const searchQuery = ref('');
    const selectedResource = ref('');
    const currentWeekStart = ref(getMonday(new Date()));

    const resources = computed(() => store.state.resources.resources);
    const bookings = computed(() => 
      store.state.bookings.bookings.filter(booking => !booking.isCancelled)
    );

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

    const timeSlots = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

    const filteredBookings = computed(() => {
      const weekDates = days.value.map(day => day.date);
      return bookings.value.filter((booking) => {
        const resource = store.getters['resources/getResourceNameById'](booking.resourceId);
        const matchesSearch = resource.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesResource = selectedResource.value ? booking.resourceId === selectedResource.value : true;
        const matchesDate = weekDates.includes(booking.date);
        return matchesSearch && matchesResource && matchesDate;
      });
    });

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

    const handleCellClick = (date, timeSlot) => {
      console.log('Выбрана ячейка:', date, timeSlot);
    };

    return {
      searchQuery,
      selectedResource,
      resources,
      days,
      timeSlots,
      weekRange,
      filteredBookings,
      prevWeek,
      nextWeek,
      handleCellClick,
      isBookingExpired
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

@media (max-width: 768px) {
  .calendar-page {
    padding: 1rem;
  }
}
</style>