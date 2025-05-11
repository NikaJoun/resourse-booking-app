<template>
  <div class="admin-header">
    <h1><i class="bi bi-shield-lock"></i> Административная панель</h1>
    <div v-if="!isAdmin" class="alert alert-danger">
      <i class="bi bi-exclamation-octagon"></i> У вас нет доступа к этой странице
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isAdmin: {
      type: Boolean,
      required: true
    }
  }
};
</script>

<style scoped>
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

@media (max-width: 576px) {
  .admin-header h1 {
    font-size: 1.75rem;
  }
}
</style>