<template>
  <div class="modal fade" id="resourceModal" tabindex="-1" aria-labelledby="resourceModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="resourceModalLabel">
            {{ isEditing ? 'Редактировать ресурс' : 'Добавить ресурс' }}
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
          <form @submit.prevent="saveResource">
            <div class="mb-3">
              <label for="resourceName" class="form-label">Название ресурса</label>
              <input 
                type="text" 
                class="form-control" 
                id="resourceName" 
                v-model="localResource.name" 
                required
              >
            </div>
            <div class="mb-3">
              <label for="resourceType" class="form-label">Тип ресурса</label>
              <select 
                class="form-select" 
                id="resourceType" 
                v-model="localResource.type" 
                required
              >
                <option value="photographer">Фотограф</option>
                <option value="conference_room">Конференц-зал</option>
                <option value="equipment">Оборудование</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="managerId" class="form-label">Ответственный менеджер</label>
              <select 
                class="form-select" 
                id="managerId" 
                v-model="localResource.managerId"
              >
                <option :value="null">Не назначено</option>
                <option v-for="manager in managers" :key="manager.id" :value="manager.id">
                  {{ manager.username }}
                </option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="hide">
                Отмена
              </button>
              <button type="submit" class="btn btn-primary">
                {{ isEditing ? 'Сохранить изменения' : 'Добавить ресурс' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { Modal } from 'bootstrap';

export default {
  props: {
    resource: {
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
      localResource: { ...this.resource },
      modalInstance: null
    };
  },
  computed: {
    ...mapGetters('users', ['getOtherUsers']),
    managers() {
      return this.getOtherUsers.filter(user => user.role === 'manager');
    }
  },
  watch: {
    resource(newVal) {
      this.localResource = { ...newVal };
    }
  },
  mounted() {
    this.modalInstance = new Modal(document.getElementById('resourceModal'));
  },
  methods: {
    ...mapActions('resources', ['addResource', 'updateResource']),
    show() {
      this.modalInstance.show();
    },
    hide() {
      this.modalInstance.hide();
    },
    async saveResource() {
      try {
        if (this.isEditing) {
          await this.updateResource(this.localResource);
        } else {
          await this.addResource(this.localResource);
        }
        
        this.$emit('saved');
        this.hide();
      } catch (error) {
        console.error('Ошибка при сохранении ресурса:', error);
      }
    }
  }
};
</script>