<template>
  <div class="admin-card admin-filters">
    <div class="filters-grid">
      <div class="filter-item">
        <label class="form-label">Ресурс</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <select class="form-select" v-model="selectedResource">
            <option value="">Все ресурсы</option>
            <option v-for="resource in resources" :key="resource.id" :value="resource.id">
              {{ resource.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="filter-item">
        <label class="form-label">Дата с</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-calendar"></i></span>
          <input type="date" class="form-control" v-model="selectedDateFrom" />
        </div>
      </div>

      <div class="filter-item">
        <label class="form-label">Дата по</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-calendar"></i></span>
          <input type="date" class="form-control" v-model="selectedDateTo" />
        </div>
      </div>

      <div class="filter-item">
        <label class="form-label">Статус</label>
        <select class="form-select" v-model="selectedStatus">
          <option value="">Все статусы</option>
          <option value="pending">Ожидает подтверждения</option>
          <option value="confirmed">Подтверждено</option>
          <option value="completed">Завершено</option>
          <option value="cancelled">Отменено</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookingFilters',
  props: {
    resources: {
      type: Array,
      default: () => []
    },
    resource: {
      type: String,
      default: ''
    },
    dateFrom: {
      type: String,
      default: ''
    },
    dateTo: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: ''
    }
  },
  emits: ['update:resource', 'update:dateFrom', 'update:dateTo', 'update:status'],
  computed: {
    selectedResource: {
      get() { return this.resource; },
      set(value) { this.$emit('update:resource', value); }
    },
    selectedDateFrom: {
      get() { return this.dateFrom; },
      set(value) { this.$emit('update:dateFrom', value); }
    },
    selectedDateTo: {
      get() { return this.dateTo; },
      set(value) { this.$emit('update:dateTo', value); }
    },
    selectedStatus: {
      get() { return this.status; },
      set(value) { this.$emit('update:status', value); }
    }
  }
}
</script>

<style scoped>
.admin-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  border: 1px solid #ebebeb;
  transition: box-shadow 0.3s ease;
}

.admin-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: 0;
  color: #6c757d;
}

.input-group .form-control,
.input-group .form-select {
  border-left: 0;
}

.input-group .form-control:focus,
.input-group .form-select:focus {
  box-shadow: none;
  border-color: #0d6efd;
}
</style>