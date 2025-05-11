<template>
  <div class="admin-header">
    <h1><i class="bi bi-gear"></i> Управление ресурсами</h1>
  </div>
</template>

<script>
export default {
  name: 'ManagerHeader'
}
</script>

<style scoped>
.admin-header {
  margin-bottom: 2rem;
}

.admin-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #212529;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-header i {
  color: #0d6efd;
}

@media (max-width: 576px) {
  .admin-header h1 {
    font-size: 1.75rem;
  }
}
</style>