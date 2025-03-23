<template>
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
              {{ isEditing ? 'Редактировать ресурс' : 'Добавить ресурс' }}
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
                <input type="text" class="form-control" id="resourceName" v-model="resource.name" required />
              </div>
              <div class="mb-3">
                <label for="resourceType" class="form-label">Тип ресурса</label>
                <select class="form-select" id="resourceType" v-model="resource.type" required>
                  <option value="photographer">Фотограф</option>
                  <option value="conference_room">Конференц-зал</option>
                  <option value="equipment">Оборудование</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="managerId" class="form-label">Ответственный менеджер</label>
                <select class="form-select" id="managerId" v-model="resource.managerId">
                  <option :value="null">Не назначено</option>
                  <option v-for="manager in managers" :key="manager.id" :value="manager.id">
                    {{ manager.username }}
                  </option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary me-2">
                {{ isEditing ? 'Сохранить изменения' : 'Добавить ресурс' }}
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
      resource: {
        type: Object,
        required: true,
      },
      isEditing: {
        type: Boolean,
        default: false,
      },
      managers: {
        type: Array,
        required: true,
      },
    },
    emits: ['save-resource'],
    methods: {
      saveResource() {
        this.$emit('save-resource', this.resource);
      },
    },
  };
  </script>