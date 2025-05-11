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
        <i class="bi bi-info-circle"></i>
        <span>ID: {{ resource.id }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getResourceIcon, formatResourceType } from '@/utils/resourceUtils';

export default {
  name: 'ResourceCard',
  props: {
    resource: {
      type: Object,
      required: true
    }
  },
  methods: {
    getResourceIcon,
    formatResourceType
  }
}
</script>

<style scoped>
.admin-card {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1.25rem;
  transition: all 0.2s ease;
}

.admin-card:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.resource-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #6c757d;
}

.resource-icon.photographer {
  background: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.resource-icon.conference_room {
  background: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.resource-icon.equipment {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.resource-title {
  flex: 1;
}

.resource-title h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #212529;
}

.resource-title .resource-type {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
  background: #f8f9fa;
  color: #6c757d;
}

.card-body {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.info-row i {
  font-size: 0.9rem;
}
</style>