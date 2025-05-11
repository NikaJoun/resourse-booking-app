<template>
  <div class="calendar-header">
    <h1><i class="bi bi-calendar-week"></i> Календарь бронирований</h1>
  </div>
</template>

<script>
export default {
  name: 'CalendarHeader'
};
</script>

<style scoped>
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

@media (max-width: 768px) {
  .calendar-header h1 {
    font-size: 1.5rem;
  }
}
</style>