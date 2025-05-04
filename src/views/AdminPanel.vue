<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1><i class="bi bi-shield-lock"></i> Административная панель</h1>
      <div v-if="!isAdmin" class="alert alert-danger">
        <i class="bi bi-exclamation-octagon"></i> У вас нет доступа к этой странице
      </div>
    </div>

    <div v-if="isAdmin" class="admin-content">
      <div class="admin-tabs">
        <div class="tabs-header">
          <button 
            @click="activeTab = 'users'" 
            :class="['tab-btn', { active: activeTab === 'users' }]"
          >
            <i class="bi bi-people"></i> Пользователи
          </button>
          <button 
            @click="activeTab = 'resources'" 
            :class="['tab-btn', { active: activeTab === 'resources' }]"
          >
            <i class="bi bi-collection"></i> Ресурсы
          </button>
        </div>

        <div class="tabs-content">
          <!-- Вкладка пользователей -->
          <div v-if="activeTab === 'users'" class="tab-pane">
            <div class="admin-filters">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Поиск по имени"
                  v-model="userSearchQuery"
                >
              </div>
              
              <select class="form-select" v-model="userRoleFilter">
                <option value="">Все роли</option>
                <option value="user">Пользователь</option>
                <option value="manager">Менеджер</option>
                <option value="admin">Администратор</option>
              </select>
              
              <button 
                @click="openUserModal(null)" 
                class="btn btn-primary"
              >
                <i class="bi bi-plus-lg"></i> Добавить пользователя
              </button>
            </div>

            <div v-if="filteredUsers.length === 0" class="empty-state">
              <i class="bi bi-people-slash"></i>
              <p>Пользователи не найдены</p>
            </div>

            <div v-else class="admin-cards">
              <div v-for="user in filteredUsers" :key="user.id" class="admin-card">
                <div class="card-header">
                  <div class="user-avatar">
                    <i class="bi bi-person-circle"></i>
                  </div>
                  <div class="user-title">
                    <h3>{{ user.username }}</h3>
                    <span :class="['user-role', user.role]">
                      {{ formatRole(user.role) }}
                    </span>
                  </div>
                </div>
                
                <div class="card-body">
                  <div class="info-row">
                    <i class="bi bi-tag"></i>
                    <span>Тип ресурса: {{ user.managedResourceType || 'Не назначено' }}</span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <button 
                    @click="openUserModal(user)" 
                    class="btn btn-sm btn-outline-primary"
                  >
                    <i class="bi bi-pencil"></i> Редактировать
                  </button>
                  <button 
                    @click="confirmDeleteUser(user.id)" 
                    class="btn btn-sm btn-outline-danger"
                  >
                    <i class="bi bi-trash"></i> Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Вкладка ресурсов -->
          <div v-if="activeTab === 'resources'" class="tab-pane">
            <div class="admin-filters">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Поиск по названию"
                  v-model="resourceSearchQuery"
                >
              </div>
              
              <select class="form-select" v-model="resourceTypeFilter">
                <option value="">Все типы</option>
                <option value="photographer">Фотограф</option>
                <option value="conference_room">Конференц-зал</option>
                <option value="equipment">Оборудование</option>
              </select>
              
              <select class="form-select" v-model="resourceManagerFilter">
                <option value="">Все менеджеры</option>
                <option v-for="manager in managers" :key="manager.id" :value="manager.id">
                  {{ manager.username }}
                </option>
              </select>
              
              <button 
                @click="openResourceModal(null)" 
                class="btn btn-primary"
              >
                <i class="bi bi-plus-lg"></i> Добавить ресурс
              </button>
            </div>

            <div v-if="filteredResources.length === 0" class="empty-state">
              <i class="bi bi-collection"></i>
              <p>Ресурсы не найдены</p>
            </div>

            <div v-else class="admin-cards">
              <div v-for="resource in filteredResources" :key="resource.id" class="admin-card">
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
                    @click="openResourceModal(resource)" 
                    class="btn btn-sm btn-outline-primary"
                  >
                    <i class="bi bi-pencil"></i> Редактировать
                  </button>
                  <button 
                    @click="confirmDeleteResource(resource.id)" 
                    class="btn btn-sm btn-outline-danger"
                  >
                    <i class="bi bi-trash"></i> Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальные окна -->
    <UserModal
      ref="userModal"
      :user="currentUser"
      :isEditing="isEditingUser"
      @saved="handleUserSaved"
    />
    
    <ResourceModal
      ref="resourceModal"
      :resource="currentResource"
      :isEditing="isEditingResource"
      @saved="handleResourceSaved"
    />

    <!-- Модальное окно подтверждения -->
    <ConfirmModal
      v-if="showConfirmModal"
      :message="confirmMessage"
      @confirm="executeConfirmAction"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import UserModal from '@/components/UserModal.vue';
import ResourceModal from '@/components/ResourceModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

export default {
  components: {
    UserModal,
    ResourceModal,
    ConfirmModal
  },
  setup() {
    const store = useStore();
    const userModal = ref(null);
    const resourceModal = ref(null);

    // Состояние
    const activeTab = ref('users');
    const isEditingUser = ref(false);
    const isEditingResource = ref(false);
    const showConfirmModal = ref(false);
    const confirmMessage = ref('');
    const actionToConfirm = ref(null);
    const actionParams = ref(null);
    
    const currentUser = ref({
      id: null,
      username: '',
      password: '',
      role: 'user',
      managedResourceType: null,
    });

    const currentResource = ref({
      id: null,
      name: '',
      type: 'photographer',
      managerId: null,
    });

    // Фильтры
    const userSearchQuery = ref('');
    const userRoleFilter = ref('');
    const resourceSearchQuery = ref('');
    const resourceTypeFilter = ref('');
    const resourceManagerFilter = ref('');

    // Геттеры
    const users = computed(() => store.state.users.users);
    const resources = computed(() => store.state.resources.resources);
    const isAdmin = computed(() => store.getters['auth/isAdmin']);
    
    const managers = computed(() => 
      store.getters['users/getOtherUsers'].filter(user => user.role === 'manager')
    );

    // Методы
    const getManagerName = (managerId) => {
      const manager = store.state.users.users.find(user => user.id === managerId);
      return manager ? manager.username : null;
    };

    const getResourceIcon = (type) => {
      switch(type) {
        case 'photographer': return 'bi bi-camera';
        case 'conference_room': return 'bi bi-building';
        case 'equipment': return 'bi bi-pc-display';
        default: return 'bi bi-collection';
      }
    };

    const formatRole = (role) => {
      switch(role) {
        case 'user': return 'Пользователь';
        case 'manager': return 'Менеджер';
        case 'admin': return 'Администратор';
        default: return role;
      }
    };

    const formatResourceType = (type) => {
      switch(type) {
        case 'photographer': return 'Фотограф';
        case 'conference_room': return 'Конференц-зал';
        case 'equipment': return 'Оборудование';
        default: return type;
      }
    };

    // Фильтрация
    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const matchesSearch = user.username.toLowerCase()
          .includes(userSearchQuery.value.toLowerCase());
        const matchesRole = userRoleFilter.value 
          ? user.role === userRoleFilter.value 
          : true;
        return matchesSearch && matchesRole;
      });
    });

    const filteredResources = computed(() => {
      return resources.value.filter(resource => {
        const matchesSearch = resource.name.toLowerCase()
          .includes(resourceSearchQuery.value.toLowerCase());
        const matchesType = resourceTypeFilter.value 
          ? resource.type === resourceTypeFilter.value 
          : true;
        const matchesManager = resourceManagerFilter.value 
          ? resource.managerId === resourceManagerFilter.value 
          : true;
        return matchesSearch && matchesType && matchesManager;
      });
    });

    // Работа с модальными окнами
    const openUserModal = (user) => {
      currentUser.value = user 
        ? { ...user } 
        : {
            id: null,
            username: '',
            password: '',
            role: 'user',
            managedResourceType: null,
          };
      isEditingUser.value = !!user;
      userModal.value.show();
    };

    const openResourceModal = (resource) => {
      currentResource.value = resource
        ? { ...resource }
        : {
            id: null,
            name: '',
            type: 'photographer',
            managerId: null,
          };
      isEditingResource.value = !!resource;
      resourceModal.value.show();
    };

    const handleUserSaved = () => {
      // Можно добавить обновление списка или другие действия
    };

    const handleResourceSaved = () => {
      // Можно добавить обновление списка или другие действия
    };

    // Подтверждение действий
    const confirmDeleteUser = (userId) => {
      const userName = users.value.find(u => u.id === userId)?.username || 'пользователя';
      confirmMessage.value = `Вы уверены, что хотите удалить ${userName}?`;
      actionToConfirm.value = (id) => store.dispatch('users/removeUser', id);
      actionParams.value = userId;
      showConfirmModal.value = true;
    };

    const confirmDeleteResource = (resourceId) => {
      const resourceName = resources.value.find(r => r.id === resourceId)?.name || 'ресурс';
      confirmMessage.value = `Вы уверены, что хотите удалить ${resourceName}?`;
      actionToConfirm.value = (id) => store.dispatch('resources/removeResource', id);
      actionParams.value = resourceId;
      showConfirmModal.value = true;
    };

    const executeConfirmAction = () => {
      if (actionToConfirm.value && actionParams.value) {
        actionToConfirm.value(actionParams.value);
      }
      showConfirmModal.value = false;
    };

    return {
      activeTab,
      isEditingUser,
      isEditingResource,
      showConfirmModal,
      confirmMessage,
      currentUser,
      currentResource,
      userSearchQuery,
      userRoleFilter,
      resourceSearchQuery,
      resourceTypeFilter,
      resourceManagerFilter,
      users,
      resources,
      isAdmin,
      managers,
      filteredUsers,
      filteredResources,
      userModal,
      resourceModal,
      getManagerName,
      getResourceIcon,
      formatRole,
      formatResourceType,
      openUserModal,
      openResourceModal,
      handleUserSaved,
      handleResourceSaved,
      confirmDeleteUser,
      confirmDeleteResource,
      executeConfirmAction
    };
  },
};
</script>

<style lang="scss" scoped>
.admin-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.admin-header {
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #212529;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    i {
      color: #0d6efd;
    }
  }
  
  .alert {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

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
  
  .user-avatar,
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
  
  .user-title,
  .resource-title {
    flex: 1;
    
    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      color: #212529;
    }
    
    .user-role,
    .resource-type {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      display: inline-block;
      
      &.user {
        background: rgba(108, 117, 125, 0.1);
        color: #6c757d;
      }
      
      &.manager {
        background: rgba(255, 193, 7, 0.1);
        color: #ffc107;
      }
      
      &.admin {
        background: rgba(220, 53, 69, 0.1);
        color: #dc3545;
      }
    }
    
    .resource-type {
      background: #f8f9fa;
      color: #6c757d;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  max-width: 500px;
  width: 100%;
  margin: 0 1rem;
}

.modal-content {
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    i {
      color: #0d6efd;
    }
  }
  
  .btn-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    opacity: 0.5;
    cursor: pointer;
    
    &:hover {
      opacity: 1;
    }
  }
}

.modal-body {
  padding: 1.5rem;
  
  p {
    margin: 0;
    font-size: 1rem;
    color: #212529;
  }
  
  .form-label {
    font-weight: 500;
  }
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  
  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-weight: 500;
    
    i {
      font-size: 1rem;
    }
  }
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
  .admin-page {
    padding: 1.5rem 1rem;
  }
  
  .tabs-header .tab-btn {
    font-size: 0.9rem;
    padding: 0.75rem 0.5rem;
  }
  
  .admin-filters {
    grid-template-columns: 1fr;
  }
  
  .admin-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .admin-header h1 {
    font-size: 1.75rem;
  }
  
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