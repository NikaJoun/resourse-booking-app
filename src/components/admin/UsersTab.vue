<template>
  <div class="tab-pane">
    <div class="admin-filters">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input
          type="text"
          class="form-control"
          placeholder="Поиск по имени"
          :value="userSearchQuery"
          @input="$emit('update:userSearchQuery', $event.target.value)"
        >
      </div>
      
      <select 
        class="form-select" 
        :value="userRoleFilter"
        @change="$emit('update:userRoleFilter', $event.target.value)"
      >
        <option value="">Все роли</option>
        <option value="user">Пользователь</option>
        <option value="manager">Менеджер</option>
        <option value="admin">Администратор</option>
      </select>
      
      <button 
        @click="$emit('openUserModal', null)" 
        class="btn btn-primary"
      >
        <i class="bi bi-plus-lg"></i> Добавить пользователя
      </button>
    </div>

    <div v-if="users.length === 0" class="empty-state">
      <i class="bi bi-people-slash"></i>
      <p>Пользователи не найдены</p>
    </div>

    <div v-else class="admin-cards">
      <UserCard
        v-for="user in users"
        :key="user.id"
        :user="user"
        @edit="$emit('openUserModal', user)"
        @delete="$emit('confirmDeleteUser', user.id)"
      />
    </div>
  </div>
</template>

<script>
import UserCard from '@/components/admin/UserCard.vue';

export default {
  components: {
    UserCard
  },
  props: {
    users: {
      type: Array,
      required: true
    },
    userSearchQuery: {
      type: String,
      default: ''
    },
    userRoleFilter: {
      type: String,
      default: ''
    }
  },
  emits: [
    'update:userSearchQuery',
    'update:userRoleFilter',
    'openUserModal',
    'confirmDeleteUser'
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