<template>
  <div class="step-content">
    <h2>Выберите тип ресурса</h2>
    <div class="resource-types">
      <button
        v-for="type in resourceTypes"
        :key="type.value"
        @click="selectType(type.value)"
        :class="['resource-type-card', { active: selectedResourceType === type.value }]"
      >
        <div class="type-icon">
          <i :class="type.icon"></i>
        </div>
        <span class="type-name">{{ type.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { resourceTypes } from '@/utils/booking';

export default {
  props: {
    selectedResourceType: {
      type: String,
      default: ''
    }
  },
  emits: ['update:selectedResourceType'],
  setup(props, { emit }) {
    const selectType = (type) => {
      emit('update:selectedResourceType', type);
    };

    return {
      resourceTypes,
      selectType
    };
  }
};
</script>

<style scoped>
.resource-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.resource-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  border-radius: 8px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.resource-type-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.resource-type-card.active {
  background: rgba(13, 110, 253, 0.1);
  border-color: #0d6efd;
}

.resource-type-card.active .type-icon {
  background: #0d6efd;
  color: white;
}

.resource-type-card.active .type-name {
  color: #0d6efd;
  font-weight: 500;
}

.type-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.type-name {
  font-size: 1rem;
  color: #333;
  text-align: center;
}
</style>