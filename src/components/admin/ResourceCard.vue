<template>
  <div class="admin-card">
    <div class="card-header">
      <div class="resource-icon" :class="resource.type">
        <i :class="getResourceIcon(resource.type)"></i>
      </div>
      <div class="resource-title">
        <h3>{{ resource.name }}</h3>
        <span class="resource-type">
          {{ formatResourceType(resource.type) }}
        </span>
      </div>
    </div>
    
    <div class="card-body">
      <div class="info-row">
        <i class="bi bi-person-gear"></i>
        <span>Ответственный: {{ getManagerName(resource.managerId) || 'Не назначено' }}</span>
      </div>
    </div>
    
    <div class="card-actions">
      <button 
        @click="$emit('edit')" 
        class="btn btn-sm btn-outline-primary"
      >
        <i class="bi bi-pencil"></i> Редактировать
      </button>
      <button 
        @click="$emit('delete')" 
        class="btn btn-sm btn-outline-danger"
      >
        <i class="bi bi-trash"></i> Удалить
      </button>
    </div>
  </div>
</template>

<script>
import { getResourceIcon, formatResourceType } from '@/utils/formatters';

export default {
  props: {
    resource: {
      type: Object,
      required: true
    },
    managers: {
      type: Array,
      required: true
    }
  },
  emits: ['edit', 'delete'],
  methods: {
    getResourceIcon,
    formatResourceType,
    getManagerName(managerId) {
      const manager = this.managers.find(m => m.id === managerId);
      return manager ? manager.username : null;
    }
  }
};
</script>

<style scoped>
.admin-card {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1.25rem;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  .resource-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    
    &.photographer {
      background: rgba(13, 110, 253, 0.1);
      color: #0d6efd;
    }
    
    &.conference_room {
      background: rgba(25, 135, 84, 0.1);
      color: #198754;
    }
    
    &.equipment {
      background: rgba(108, 117, 125, 0.1);
      color: #6c757d;
    }
  }
  
  .resource-title {
    flex: 1;
    
    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      color: #212529;
    }
    
    .resource-type {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      background: #f8f9fa;
      color: #6c757d;
      display: inline-block;
    }
  }
}

.card-body {
  margin-bottom: 1rem;
  
  .info-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
    
    i {
      font-size: 0.9rem;
    }
  }
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  border-top: 1px solid #f1f1f1;
  padding-top: 1rem;
  
  .btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.85rem;
    padding: 0.35rem 0.75rem;
    
    i {
      font-size: 0.9rem;
    }
  }
}
</style>