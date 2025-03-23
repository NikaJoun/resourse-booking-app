<template>
  <div class="admin-container">
    <div class="admin-card">
      <h1 class="admin-title">Админ-панель</h1>
      <div v-if="isAdmin">
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'users' }"
              @click="activeTab = 'users'"
            >
              Пользователи
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'resources' }"
              @click="activeTab = 'resources'"
            >
              Ресурсы
            </a>
          </li>
        </ul>

        <div v-if="activeTab === 'users'" class="tab-content">
          <div class="mb-4">
            <input
              type="text"
              class="form-control mb-2"
              placeholder="Поиск по имени"
              v-model="userSearchQuery"
            />
            <select class="form-select" v-model="userRoleFilter">
              <option value="">Все роли</option>
              <option value="user">Пользователь</option>
              <option value="manager">Менеджер</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          <button
            type="button"
            class="btn btn-success mb-4"
            data-bs-toggle="modal"
            data-bs-target="#userModal"
            @click="openUserModal(null)"
          >
            Добавить пользователя
          </button>

          <ul class="user-list">
            <li v-for="user in filteredUsers" :key="user.id" class="user-item">
              <div class="user-info">
                <strong>Имя:</strong> {{ user.username }} <br />
                <strong>Роль:</strong> {{ user.role }} <br />
                <strong>Тип ресурса:</strong>
                {{ user.managedResourceType || 'Не назначено' }}
              </div>
              <div class="user-actions">
                <button
                  type="button"
                  class="btn btn-primary me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#userModal"
                  @click="openUserModal(user)"
                >
                  Редактировать
                </button>
                <button @click="deleteUser(user.id)" class="btn btn-danger">Удалить</button>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="activeTab === 'resources'" class="tab-content">
          <div class="mb-4">
            <input
              type="text"
              class="form-control mb-2"
              placeholder="Поиск по названию"
              v-model="resourceSearchQuery"
            />
            <select class="form-select mb-2" v-model="resourceTypeFilter">
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
          </div>

          <button
            type="button"
            class="btn btn-success mb-4"
            data-bs-toggle="modal"
            data-bs-target="#resourceModal"
            @click="openResourceModal(null)"
          >
            Добавить ресурс
          </button>

          <ul class="resource-list">
            <li v-for="resource in filteredResources" :key="resource.id" class="resource-item">
              <div class="resource-info">
                <strong>Название:</strong> {{ resource.name }} <br />
                <strong>Тип:</strong> {{ resource.type }} <br />
                <strong>Ответственный:</strong>
                {{ getManagerName(resource.managerId) || 'Не назначено' }}
              </div>
              <div class="resource-actions">
                <button
                  type="button"
                  class="btn btn-primary me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#resourceModal"
                  @click="openResourceModal(resource)"
                >
                  Редактировать
                </button>
                <button @click="deleteResource(resource.id)" class="btn btn-danger">Удалить</button>
              </div>
            </li>
          </ul>
        </div>

        <UserModal
          :user="currentUser"
          :is-editing="isEditingUser"
          @save-user="saveUser"
        />

        <ResourceModal
          :resource="currentResource"
          :is-editing="isEditingResource"
          :managers="managers"
          @save-resource="saveResource"
        />
      </div>
      <div v-else>
        <p>У вас нет доступа к этой странице.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import UserModal from '@/components/UserModal.vue';
import ResourceModal from '@/components/ResourceModal.vue';

export default {
  components: {
    UserModal,
    ResourceModal,
  },
  setup() {
    const store = useStore();

    const users = computed(() => store.state.users);
    const resources = computed(() => store.state.resources);
    const isAdmin = computed(() => store.getters.isAdmin);

    const activeTab = ref('users');
    const isEditingUser = ref(false);
    const isEditingResource = ref(false);

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

    const userSearchQuery = ref('');
    const userRoleFilter = ref('');
    const resourceSearchQuery = ref('');
    const resourceTypeFilter = ref('');
    const resourceManagerFilter = ref('');

    const managers = computed(() =>
      store.state.users.filter((user) => user.role === 'manager')
    );

    const getManagerName = (managerId) => {
      const manager = store.state.users.find((user) => user.id === managerId);
      return manager ? manager.username : null;
    };

    const filteredUsers = computed(() => {
      return users.value.filter((user) => {
        const matchesSearch = user.username.toLowerCase().includes(userSearchQuery.value.toLowerCase());
        const matchesRole = userRoleFilter.value ? user.role === userRoleFilter.value : true;
        return matchesSearch && matchesRole;
      });
    });

    const filteredResources = computed(() => {
      return resources.value.filter((resource) => {
        const matchesSearch = resource.name.toLowerCase().includes(resourceSearchQuery.value.toLowerCase());
        const matchesType = resourceTypeFilter.value ? resource.type === resourceTypeFilter.value : true;
        const matchesManager = resourceManagerFilter.value ? resource.managerId === resourceManagerFilter.value : true;
        return matchesSearch && matchesType && matchesManager;
      });
    });

    const openUserModal = (user) => {
      if (user) {
        currentUser.value = { ...user };
        isEditingUser.value = true;
      } else {
        currentUser.value = {
          id: null,
          username: '',
          password: '',
          role: 'user',
          managedResourceType: null,
        };
        isEditingUser.value = false;
      }
    };

    const deleteUser = (userId) => {
      if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        store.commit('REMOVE_USER', userId);
      }
    };

    const saveUser = (user) => {
      if (isEditingUser.value) {
        store.commit('UPDATE_USER', user);
      } else {
        store.commit('ADD_USER', user);
      }
    };

    const openResourceModal = (resource) => {
      if (resource) {
        currentResource.value = { ...resource };
        isEditingResource.value = true;
      } else {
        currentResource.value = {
          id: null,
          name: '',
          type: 'photographer',
          managerId: null,
        };
        isEditingResource.value = false;
      }
    };

    const deleteResource = (resourceId) => {
      if (confirm('Вы уверены, что хотите удалить этот ресурс?')) {
        store.commit('REMOVE_RESOURCE', resourceId);
      }
    };

    const saveResource = (resource) => {
      if (isEditingResource.value) {
        store.commit('UPDATE_RESOURCE', resource);
      } else {
        store.commit('ADD_RESOURCE', resource);
      }
    };

    return {
      users,
      resources,
      isAdmin,
      activeTab,
      isEditingUser,
      isEditingResource,
      currentUser,
      currentResource,
      managers,
      getManagerName,
      openUserModal,
      deleteUser,
      saveUser,
      openResourceModal,
      deleteResource,
      saveResource,
      userSearchQuery,
      userRoleFilter,
      resourceSearchQuery,
      resourceTypeFilter,
      resourceManagerFilter,
      filteredUsers,
      filteredResources,
    };
  },
};
</script>

<style lang="scss" scoped>
.admin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.admin-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
}

.admin-title {
  font-size: 2rem;
  font-weight: 700;
  color: #343a40;
  text-align: center;
  margin-bottom: 1.5rem;
}

.nav-tabs {
  border-bottom: 2px solid #dee2e6;

  .nav-link {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px 8px 0 0;
    font-size: 1rem;
    font-weight: 500;
    color: #495057;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      background-color: #f8f9fa;
    }

    &.active {
      color: #007bff;
      border-bottom: 2px solid #007bff;
      background-color: transparent;
    }
  }
}

.user-list,
.resource-list {
  list-style: none;
  padding: 0;
}

.user-item,
.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #f8f9fa;
}

.user-info,
.resource-info {
  flex: 1;

  strong {
    color: #343a40;
  }
}

.user-actions,
.resource-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.modal-content {
  border-radius: 12px;
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
}
</style>