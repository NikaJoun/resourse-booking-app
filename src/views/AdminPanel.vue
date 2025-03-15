<template>
  <div class="admin-container">
    <div class="admin-card">
      <h1 class="admin-title">Админ-панель</h1>
      <div v-if="isAdmin">
        <!-- Таб-меню -->
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

        <!-- Контент для вкладки "Пользователи" -->
        <div v-if="activeTab === 'users'" class="tab-content">
          <button
            type="button"
            class="btn btn-success mb-4"
            data-bs-toggle="modal"
            data-bs-target="#userModal"
            @click="openUserModal(null)"
          >
            Добавить пользователя
          </button>

          <!-- Список пользователей -->
          <ul class="user-list">
            <li v-for="user in users" :key="user.id" class="user-item">
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

        <!-- Контент для вкладки "Ресурсы" -->
        <div v-if="activeTab === 'resources'" class="tab-content">
          <button
            type="button"
            class="btn btn-success mb-4"
            data-bs-toggle="modal"
            data-bs-target="#resourceModal"
            @click="openResourceModal(null)"
          >
            Добавить ресурс
          </button>

          <!-- Список ресурсов -->
          <ul class="resource-list">
            <li v-for="resource in resources" :key="resource.id" class="resource-item">
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

        <!-- Модальное окно для пользователя -->
        <div
          class="modal fade"
          id="userModal"
          tabindex="-1"
          aria-labelledby="userModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="userModalLabel">
                  {{ isEditingUser ? 'Редактировать пользователя' : 'Добавить пользователя' }}
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="saveUser">
                  <div class="mb-3">
                    <label for="username" class="form-label">Имя пользователя</label>
                    <input type="text" class="form-control" id="username" v-model="currentUser.username" required />
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">Пароль</label>
                    <input type="password" class="form-control" id="password" v-model="currentUser.password" required />
                  </div>
                  <div class="mb-3">
                    <label for="role" class="form-label">Роль</label>
                    <select class="form-select" id="role" v-model="currentUser.role" required>
                      <option value="user">Пользователь</option>
                      <option value="manager">Менеджер</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>
                  <div class="mb-3" v-if="currentUser.role === 'manager'">
                    <label for="managedResourceType" class="form-label">Тип ресурса</label>
                    <select class="form-select" id="managedResourceType" v-model="currentUser.managedResourceType">
                      <option value="photographer">Фотограф</option>
                      <option value="conference_room">Конференц-зал</option>
                      <option value="equipment">Оборудование</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary me-2">
                    {{ isEditingUser ? 'Сохранить изменения' : 'Добавить пользователя' }}
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Отмена
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Модальное окно для ресурса -->
        <div
          class="modal fade"
          id="resourceModal"
          tabindex="-1"
          aria-labelledby="resourceModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="resourceModalLabel">
                  {{ isEditingResource ? 'Редактировать ресурс' : 'Добавить ресурс' }}
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="saveResource">
                  <div class="mb-3">
                    <label for="resourceName" class="form-label">Название ресурса</label>
                    <input type="text" class="form-control" id="resourceName" v-model="currentResource.name" required />
                  </div>
                  <div class="mb-3">
                    <label for="resourceType" class="form-label">Тип ресурса</label>
                    <select class="form-select" id="resourceType" v-model="currentResource.type" required>
                      <option value="photographer">Фотограф</option>
                      <option value="conference_room">Конференц-зал</option>
                      <option value="equipment">Оборудование</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="managerId" class="form-label">Ответственный менеджер</label>
                    <select class="form-select" id="managerId" v-model="currentResource.managerId">
                      <option :value="null">Не назначено</option>
                      <option v-for="manager in managers" :key="manager.id" :value="manager.id">
                        {{ manager.username }}
                      </option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary me-2">
                    {{ isEditingResource ? 'Сохранить изменения' : 'Добавить ресурс' }}
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Отмена
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
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

export default {
  setup() {
    const store = useStore();

    const users = computed(() => store.state.users);
    const resources = computed(() => store.state.resources);
    const isAdmin = computed(() => store.getters.isAdmin);

    const activeTab = ref('users'); // Активная вкладка по умолчанию
    const isUserModalOpen = ref(false);
    const isResourceModalOpen = ref(false);
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

    const managers = computed(() =>
      store.state.users.filter((user) => user.role === 'manager')
    );

    const getManagerName = (managerId) => {
      const manager = store.state.users.find((user) => user.id === managerId);
      return manager ? manager.username : null;
    };

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
      isUserModalOpen.value = true;
    };

    const closeUserModal = () => {
      isUserModalOpen.value = false;
    };

    const deleteUser = (userId) => {
      if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        store.commit('REMOVE_USER', userId);
      }
    };

    const saveUser = () => {
      if (isEditingUser.value) {
        store.commit('UPDATE_USER', currentUser.value);
      } else {
        store.commit('ADD_USER', currentUser.value);
      }
      closeUserModal();
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
      isResourceModalOpen.value = true;
    };

    const closeResourceModal = () => {
      isResourceModalOpen.value = false;
    };

    const deleteResource = (resourceId) => {
      if (confirm('Вы уверены, что хотите удалить этот ресурс?')) {
        store.commit('REMOVE_RESOURCE', resourceId);
      }
    };

    const saveResource = () => {
      if (isEditingResource.value) {
        store.commit('UPDATE_RESOURCE', currentResource.value);
      } else {
        store.commit('ADD_RESOURCE', currentResource.value);
      }
      closeResourceModal();
    };

    return {
      users,
      resources,
      isAdmin,
      activeTab,
      isUserModalOpen,
      isResourceModalOpen,
      isEditingUser,
      isEditingResource,
      currentUser,
      currentResource,
      managers,
      getManagerName,
      openUserModal,
      closeUserModal,
      deleteUser,
      saveUser,
      openResourceModal,
      closeResourceModal,
      deleteResource,
      saveResource,
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