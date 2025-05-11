<template>
  <div class="tabs-header">
    <button 
      @click="$emit('update:activeTab', 'active')" 
      :class="['tab-btn', { active: activeTab === 'active' }]"
    >
      <i class="bi bi-calendar-check"></i> Активные бронирования
    </button>
    <button 
      @click="$emit('update:activeTab', 'history')" 
      :class="['tab-btn', { active: activeTab === 'history' }]"
    >
      <i class="bi bi-clock-history"></i> История бронирований
    </button>
  </div>
</template>

<script>
export default {
  props: {
    activeTab: {
      type: String,
      required: true
    }
  },
  emits: ['update:activeTab']
};
</script>

<style lang="scss" scoped>
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

@media (max-width: 576px) {
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