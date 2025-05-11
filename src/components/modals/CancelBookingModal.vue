<template>
  <div class="modal-overlay">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="bi bi-exclamation-triangle"></i> Подтверждение отмены</h3>
        </div>
        <div class="modal-body">
          <p>Вы уверены, что хотите отменить это бронирование?</p>
        </div>
        <div class="modal-footer">
          <button @click="$emit('close')" class="btn btn-secondary">
            <i class="bi bi-arrow-left"></i> Отмена
          </button>
          <button @click="$emit('confirm')" class="btn btn-danger">
            <i class="bi bi-trash"></i> Подтвердить отмену
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['close', 'confirm']
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
      color: #ffc107;
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