<template>
  <div class="admin-tabs">
    <div class="tabs-header">
      <button 
        @click="$emit('update:activeTab', 'users')" 
        :class="['tab-btn', { active: activeTab === 'users' }]"
      >
        <i class="bi bi-people"></i> Пользователи
      </button>
      <button 
        @click="$emit('update:activeTab', 'resources')" 
        :class="['tab-btn', { active: activeTab === 'resources' }]"
      >
        <i class="bi bi-collection"></i> Ресурсы
      </button>
    </div>

    <div class="tabs-content">
      <slot name="users" v-if="activeTab === 'users'"></slot>
      <slot name="resources" v-if="activeTab === 'resources'"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    activeTab: {
      type: String,
      required: true,
      validator: value => ['users', 'resources'].includes(value)
    }
  },
  emits: ['update:activeTab']
};
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

.tabs-content {
  padding: 1.5rem;
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