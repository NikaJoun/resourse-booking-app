<template>
  <div class="calendar-controls">
    <div class="search-filter">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          placeholder="Поиск по ресурсу..."
          class="form-control"
        />
      </div>
      <select 
        :value="selectedResource"
        @change="$emit('update:selectedResource', $event.target.value)"
        class="form-select"
      >
        <option value="">Все ресурсы</option>
        <option v-for="resource in resources" :key="resource.id" :value="resource.id">
          {{ resource.name }}
        </option>
      </select>
    </div>
    <div class="week-navigation">
      <button @click="$emit('prev-week')" class="btn btn-outline-primary">
        <i class="bi bi-chevron-left"></i>
      </button>
      <div class="week-range">{{ weekRange }}</div>
      <button @click="$emit('next-week')" class="btn btn-outline-primary">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarControls',
  props: {
    searchQuery: String,
    selectedResource: String,
    weekRange: String,
    resources: Array
  },
  emits: [
    'update:searchQuery', 
    'update:selectedResource', 
    'prev-week', 
    'next-week'
  ]
};
</script>

<style scoped>
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
</style>