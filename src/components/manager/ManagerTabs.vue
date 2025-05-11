<template>
  <div class="admin-tabs">
    <div class="tabs-header">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        @click="changeTab(tab.id)"
        :class="['tab-btn', { active: activeTab === tab.id }]"
      >
        <i :class="`bi bi-${tab.icon}`"></i> {{ tab.label }}
      </button>
    </div>

    <div class="tabs-content">
      <slot :name="activeTab"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ManagerTabs',
  props: {
    activeTab: {
      type: String,
      default: 'resources'
    }
  },
  emits: ['tab-change'],
  data() {
    return {
      tabs: [
        { id: 'resources', label: 'Мои ресурсы', icon: 'collection' },
        { id: 'bookings', label: 'Подтверждение бронирований', icon: 'clock-history' },
        { id: 'allBookings', label: 'Все бронирования', icon: 'calendar-check' }
      ]
    }
  },
  methods: {
    changeTab(tab) {
      this.$emit('tab-change', tab);
    }
  }
}
</script>

<style scoped>
.admin-tabs {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #dee2e6;
}

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
}

.tab-btn i {
  font-size: 1.1rem;
}

.tab-btn:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
}

.tab-btn.active {
  color: #0d6efd;
  border-bottom: 2px solid #0d6efd;
  background-color: rgba(13, 110, 253, 0.05);
}

.tabs-content {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .tab-btn {
    font-size: 0.9rem;
    padding: 0.75rem 0.5rem;
  }
}

@media (max-width: 576px) {
  .tabs-header {
    flex-direction: column;
  }
  
  .tab-btn {
    padding: 0.75rem;
    justify-content: flex-start;
    border-bottom: 1px solid #dee2e6;
  }
  
  .tab-btn.active {
    border-bottom: 2px solid #0d6efd;
  }
}
</style>