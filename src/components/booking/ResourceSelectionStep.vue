<template>
  <div class="step-content">
    <h2>Выберите ресурс</h2>
    <div class="resource-list">
      <div
        v-for="resource in filteredResources"
        :key="resource.id"
        @click="selectResource(resource)"
        :class="['resource-card', { active: selectedResource?.id === resource.id }]"
      >
        <div class="resource-icon">
          <i :class="getResourceIcon(resource.type)"></i>
        </div>
        <div class="resource-info">
          <h3>{{ resource.name }}</h3>
          <p v-if="resource.description">{{ resource.description }}</p>
          <div class="working-hours">
            <i class="bi bi-clock"></i>
            {{ resource.workingHours.start }} - {{ resource.workingHours.end }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { getResourceIcon, defaultWorkingHours } from '@/utils/booking';

export default {
  props: {
    resourceType: {
      type: String,
      required: true
    },
    selectedResource: {
      type: Object,
      default: null
    }
  },
  emits: ['update:selectedResource'],
  setup(props, { emit }) {
    const store = useStore();

    const filteredResources = computed(() => {
      if (!props.resourceType) return [];
      return store.state.resources.resources
        .filter(resource => resource.type === props.resourceType)
        .map(resource => ({
          ...resource,
          workingHours: resource.workingHours || defaultWorkingHours
        }));
    });

    const selectResource = (resource) => {
      emit('update:selectedResource', resource);
    };

    return {
      filteredResources,
      selectResource,
      getResourceIcon
    };
  }
};
</script>

<style scoped>
.resource-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.resource-card {
  display: flex;
  align-items: flex-start;
  padding: 1.25rem;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.resource-card.active {
  background: rgba(13, 110, 253, 0.05);
  border-color: #0d6efd;
}

.resource-card.active .resource-icon {
  background: #0d6efd;
  color: white;
}

.resource-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-right: 1rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.resource-info {
  flex: 1;
}

.resource-info h3 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.resource-info p {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.working-hours {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  color: #666;
}

.working-hours i {
  margin-right: 0.25rem;
  font-size: 0.875rem;
}
</style>