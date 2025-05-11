<template>
  <div class="modal-overlay">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="bi bi-calendar-plus"></i> Экспорт бронирований</h3>
        </div>
        <div class="modal-body">
          <p>Вы хотите экспортировать все бронирования в файл календаря (ICS)?</p>
          <p class="text-muted">Файл можно импортировать в Google Calendar, Outlook и другие календарные приложения.</p>
        </div>
        <div class="modal-footer">
          <button @click="$emit('close')" class="btn btn-secondary">
            <i class="bi bi-arrow-left"></i> Отмена
          </button>
          <button @click="handleDownload" class="btn btn-primary">
            <i class="bi bi-download"></i> Экспорт
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['close', 'download'],
  methods: {
    handleDownload() {
      this.$emit('download');
      this.$emit('close');
    }
  }
};
</script>

<style lang="scss" scoped>
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
}

.modal-body {
  padding: 1.5rem;
  
  p {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: #212529;
    
    &.text-muted {
      color: #6c757d;
      font-size: 0.9rem;
    }
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
</style>