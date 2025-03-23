<template>
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
              {{ isEditing ? 'Редактировать пользователя' : 'Добавить пользователя' }}
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
                <input type="text" class="form-control" id="username" v-model="user.username" required />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Пароль</label>
                <input type="password" class="form-control" id="password" v-model="user.password" required />
              </div>
              <div class="mb-3">
                <label for="role" class="form-label">Роль</label>
                <select class="form-select" id="role" v-model="user.role" required>
                  <option value="user">Пользователь</option>
                  <option value="manager">Менеджер</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              <div class="mb-3" v-if="user.role === 'manager'">
                <label for="managedResourceType" class="form-label">Тип ресурса</label>
                <select class="form-select" id="managedResourceType" v-model="user.managedResourceType">
                  <option value="photographer">Фотограф</option>
                  <option value="conference_room">Конференц-зал</option>
                  <option value="equipment">Оборудование</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary me-2">
                {{ isEditing ? 'Сохранить изменения' : 'Добавить пользователя' }}
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
  </template>
  
  <script>
  export default {
    props: {
      user: {
        type: Object,
        required: true,
      },
      isEditing: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['save-user'],
    methods: {
      saveUser() {
        this.$emit('save-user', this.user);
      },
    },
  };
  </script>