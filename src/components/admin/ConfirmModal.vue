<template>
    <div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle"></i> Подтверждение
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              @click="cancel"
            ></button>
          </div>
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button @click="cancel" class="btn btn-secondary">
              <i class="bi bi-x-lg"></i> Отмена
            </button>
            <button @click="confirm" class="btn btn-danger">
              <i class="bi bi-check-lg"></i> Подтвердить
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { Modal } from 'bootstrap';
  
  export default {
    props: {
      message: {
        type: String,
        required: true
      }
    },
    emits: ['confirm', 'cancel'],
    data() {
      return {
        modalInstance: null
      };
    },
    mounted() {
      this.modalInstance = new Modal(document.getElementById('confirmModal'));
      this.modalInstance.show();
    },
    methods: {
      confirm() {
        this.$emit('confirm');
        this.modalInstance.hide();
      },
      cancel() {
        this.$emit('cancel');
        this.modalInstance.hide();
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }
  
  .modal-title i {
    color: #dc3545;
    margin-right: 0.5rem;
  }
  
  .modal-body p {
    font-size: 1.1rem;
    margin: 0;
  }
  
  .modal-footer {
    justify-content: flex-end;
  }
  </style>