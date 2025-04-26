<template>
  <div class="notification-modal-wrapper" :class="{show: isOpen}">
    <div class="notification-modal">
      <div class="modal-header">
        <div class="header-content">
          <h5 class="modal-title">Уведомления</h5>
          <span v-if="unreadNotificationCount > 0" class="unread-count">
            {{ unreadNotificationCount }} новых
          </span>
        </div>
        <button 
          type="button" 
          class="close-btn" 
          @click="$emit('close')"
          aria-label="Close"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="notifications.length === 0" class="empty-notifications">
          <div class="empty-icon">
            <i class="bi bi-bell"></i>
          </div>
          <p>Нет новых уведомлений</p>
        </div>

        <div 
          v-for="(n, index) in notifications.slice(0, 5)" 
          :key="index" 
          class="notification-item" 
          :class="{ 'unread': !n.isRead }"
          @click="markAsRead(n.id)"
        >
          <div class="notification-icon" :class="'type-' + n.type">
            <i class="bi" :class="getNotificationIcon(n.type)"></i>
          </div>
          <div class="notification-content">
            <p class="notification-text">{{ n.text }}</p>
            <div class="notification-meta">
              <span class="notification-time">{{ formatNotificationTime(n.timestamp) }}</span>
              <span v-if="!n.isRead" class="unread-badge">Новое</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button 
          class="mark-all-btn" 
          @click="markAllAsRead"
          :disabled="notifications.length === 0 || unreadNotificationCount === 0"
        >
          <i class="bi bi-check-all"></i> Отметить все как прочитанные
        </button>
        <router-link 
          to="/notifications" 
          class="view-all-link"
          @click="$emit('view-all')"
        >
          Показать все <i class="bi bi-chevron-right"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    notifications: {
      type: Array,
      required: true
    },
    unreadNotificationCount: {
      type: Number,
      default: 0
    }
  },
  methods: {
    formatNotificationTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    },
    markAsRead(notificationId) {
      this.$emit('mark-as-read', notificationId);
    },
    markAllAsRead() {
      this.$emit('mark-all-read');
    },
    getNotificationIcon(type) {
      const icons = {
        message: 'bi-chat-square-text',
        booking: 'bi-calendar-check',
        system: 'bi-info-circle'
      };
      return icons[type] || 'bi-bell';
    }
  }
};
</script>

<style lang="scss" scoped>
.notification-modal-wrapper {
  position: fixed;
  bottom: 0;
  left: 20px;
  z-index: 1050;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  will-change: transform;
  
  &.show {
    transform: translateY(0);
  }
}

.notification-modal {
  background: white;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
  width: 380px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e9ecef;
  border-bottom: none;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f3f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  
  .header-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .modal-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #212529;
  }
  
  .unread-count {
    background: #228be6;
    color: white;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #868e96;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.2s;
    
    &:hover {
      background: #f1f3f5;
      color: #495057;
    }
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.empty-notifications {
  padding: 40px 20px;
  text-align: center;
  
  .empty-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 15px;
    background: #f8f9fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .bi {
      font-size: 1.8rem;
      color: #adb5bd;
    }
  }
  
  p {
    margin: 0;
    font-size: 0.95rem;
    color: #868e96;
  }
}

.notification-item {
  padding: 14px 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f1f3f5;
  }
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.unread {
    background: #f8fbff;
    
    .notification-text {
      font-weight: 500;
    }
  }
}

.notification-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  
  &.type-message {
    background: #e3f2fd;
    color: #1976d2;
  }
  
  &.type-booking {
    background: #e8f5e9;
    color: #388e3c;
  }
  
  &.type-system {
    background: #fff3e0;
    color: #ffa000;
  }
  
  .bi {
    font-size: 1.1rem;
  }
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  margin: 0 0 6px 0;
  color: #212529;
  font-size: 0.95rem;
  line-height: 1.4;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-time {
  color: #868e96;
  font-size: 0.8rem;
}

.unread-badge {
  background: #e9ecef;
  color: #495057;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #f1f3f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  
  .mark-all-btn {
    background: none;
    border: none;
    color: #228be6;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    
    &:hover:not(:disabled) {
      background: #f1f8ff;
    }
    
    &:disabled {
      color: #adb5bd;
      cursor: not-allowed;
    }
  }
  
  .view-all-link {
    color: #495057;
    font-size: 0.9rem;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
    
    &:hover {
      color: #228be6;
    }
    
    .bi {
      font-size: 0.9rem;
    }
  }
}

@media (max-width: 480px) {
  .notification-modal-wrapper {
    left: 0;
    right: 0;
    width: 100%;
  }
  
  .notification-modal {
    width: 100%;
    max-width: 100%;
    border-radius: 12px 12px 0 0;
  }
  
  .notification-item {
    padding: 12px 16px;
  }
}
</style>