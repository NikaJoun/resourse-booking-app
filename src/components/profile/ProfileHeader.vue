<template>
  <div class="profile-header">
    <h1><i class="bi bi-person-circle"></i>Личный кабинет</h1>
    <div v-if="user" class="user-info">
      <div class="user-avatar">
        <i class="bi bi-person-fill"></i>
      </div>
      <div class="user-details">
        <h2>Добро пожаловать, {{ user.username }}!</h2>
        <div class="user-meta">
          <div class="meta-item">
            <i class="bi bi-person-badge"></i>
            <span>ID: {{ user.id }}</span>
          </div>
          <div class="meta-item">
            <i class="bi bi-shield"></i>
            <span>Роль: {{ formatRole(user.role) }}</span>
          </div>
          <div v-if="user.managedResourceType" class="meta-item">
            <i class="bi bi-gear"></i>
            <span>Управляет: {{ user.managedResourceType }}</span>
          </div>
        </div>
      </div>
      <button @click="$emit('sync')" class="btn btn-primary sync-btn">
        <i class="bi bi-calendar-plus"></i> Синхронизировать все бронирования
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: Object,
    formatRole: Function
  }
};
</script>

<style lang="scss" scoped>
.profile-header {
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #212529;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    
    i {
      font-size: 1.8rem;
      color: #0d6efd;
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #0d6efd;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.user-details {
  flex: 1;
  
  h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1.5rem;
    color: #212529;
  }
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #495057;
  
  i {
    color: #6c757d;
  }
}

.sync-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  
  i {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .profile-header h1 {
    font-size: 1.75rem;
  }
}

@media (max-width: 576px) {
  .profile-header h1 {
    font-size: 1.5rem;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .user-avatar {
    margin: 0 auto;
  }
  
  .sync-btn {
    align-self: center;
  }
}
</style>