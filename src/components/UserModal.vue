<template>
  <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
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
            @click="hide"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveUser">
            <div class="mb-3">
              <label for="username" class="form-label">Имя пользователя</label>
              <input 
                type="text" 
                class="form-control" 
                id="username" 
                v-model="localUser.username" 
                required
              >
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Пароль</label>
              <input 
                type="password" 
                class="form-control" 
                id="password" 
                v-model="localUser.password"
                :required="!isEditing"
              >
            </div>
            <div class="mb-3">
              <label for="role" class="form-label">Роль</label>
              <select 
                class="form-select" 
                id="role" 
                v-model="localUser.role" 
                required
                @change="handleRoleChange"
              >
                <option value="user">Пользователь</option>
                <option value="manager">Менеджер</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            <div class="mb-3" v-if="localUser.role === 'manager'">
              <label for="managedResourceType" class="form-label">Тип ресурса</label>
              <select 
                class="form-select" 
                id="managedResourceType" 
                v-model="localUser.managedResourceType"
              >
                <option value="photographer">Фотограф</option>
                <option value="conference_room">Конференц-зал</option>
                <option value="equipment">Оборудование</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="hide">
                Отмена
              </button>
              <button type="submit" class="btn btn-primary">
                {{ isEditing ? 'Сохранить изменения' : 'Добавить пользователя' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { Modal } from 'bootstrap';

export default {
  props: {
    user: {
      type: Object,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['saved'],
  data() {
    return {
      localUser: { ...this.user },
      modalInstance: null
    };
  },
  watch: {
    user(newVal) {
      this.localUser = { ...newVal };
    }
  },
  mounted() {
    this.modalInstance = new Modal(document.getElementById('userModal'));
  },
  methods: {
    ...mapActions('users', ['addUser', 'updateUser']),
    show() {
      this.modalInstance.show();
    },
    hide() {
      this.modalInstance.hide();
    },
    handleRoleChange() {
      if (this.localUser.role !== 'manager') {
        this.localUser.managedResourceType = null;
      }
    },
    async saveUser() {
      try {
        const userData = { ...this.localUser };
        
        if (this.isEditing && !userData.password) {
          delete userData.password;
        }

        if (this.isEditing) {
          await this.updateUser(userData);
        } else {
          await this.addUser(userData);
        }
        
        this.$emit('saved');
        this.hide();
      } catch (error) {
        console.error('Ошибка при сохранении пользователя:', error);
      }
    }
  }
};
</script>