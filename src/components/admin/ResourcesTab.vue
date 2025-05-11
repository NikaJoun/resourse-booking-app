<template>
  <div class="tab-pane">
    <div class="admin-filters">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input
          type="text"
          class="form-control"
          placeholder="Поиск по названию"
          :value="resourceSearchQuery"
          @input="$emit('update:resourceSearchQuery', $event.target.value)"
        >
      </div>
      
      <select 
        class="form-select" 
        :value="resourceTypeFilter"
        @change="$emit('update:resourceTypeFilter', $event.target.value)"
      >
        <option value="">Все типы</option>
        <option value="photographer">Фотограф</option>
        <option value="conference_room">Конференц-зал</option>
        <option value="equipment">Оборудование</option>
      </select>
      
      <select 
        class="form-select" 
        :value="resourceManagerFilter"
        @change="$emit('update:resourceManagerFilter', $event.target.value === '' ? '' : $event.target.value)"
      >
        <option value="">Все менеджеры</option>
        <option v-for="manager in managers" :key="manager.id" :value="manager.id">
        {{ manager.username }}
        </option>
      </select>
      
      <button 
        @click="$emit('openResourceModal', null)" 
        class="btn btn-primary"
      >
        <i class="bi bi-plus-lg"></i> Добавить ресурс
      </button>
    </div>

    <div v-if="resources.length === 0" class="empty-state">
      <i class="bi bi-collection"></i>
      <p>Ресурсы не найдены</p>
    </div>

    <div v-else class="admin-cards">
      <ResourceCard
        v-for="resource in resources"
        :key="resource.id"
        :resource="resource"
        :managers="managers"
        @edit="$emit('openResourceModal', resource)"
        @delete="$emit('confirmDeleteResource', resource.id)"
      />
    </div>
  </div>
</template>

<script>
import ResourceCard from '@/components/admin/ResourceCard.vue';

export default {
  components: {
    ResourceCard
  },
  props: {
    resources: {
      type: Array,
      required: true
    },
    managers: {
      type: Array,
      required: true
    },
    resourceSearchQuery: {
      type: String,
      default: ''
    },
    resourceTypeFilter: {
      type: String,
      default: ''
    },
    resourceManagerFilter: {
      type: String,
      default: ''
    }
  },
  emits: [
    'update:resourceSearchQuery',
    'update:resourceTypeFilter',
    'update:resourceManagerFilter',
    'openResourceModal',
    'confirmDeleteResource'
  ]
};
</script>

<style scoped>
.admin-filters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    height: 100%;
    
    i {
      font-size: 1rem;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
  
  i {
    font-size: 3rem;
    color: #adb5bd;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0;
  }
}

.admin-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

@media (max-width: 992px) {
  .admin-filters {
    grid-template-columns: 1fr 1fr;
  }
  
  .admin-cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .admin-filters {
    grid-template-columns: 1fr;
  }
  
  .admin-cards {
    grid-template-columns: 1fr;
  }
}
</style>