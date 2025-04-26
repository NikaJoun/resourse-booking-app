<template>
  <div class="notifications-page">
    <div class="container">
      <div class="notifications-header">
        <h1 class="page-title">Уведомления</h1>
        <button @click="markAllAsRead" class="mark-all-btn">
          <i class="bi bi-check-all"></i> Отметить все как прочитанные
        </button>
      </div>
      
      <div v-if="notifications.length === 0" class="no-notifications">
        <div class="empty-state">
          <i class="bi bi-bell-slash"></i>
          <p>У вас нет уведомлений</p>
        </div>
      </div>
      
      <ul class="notifications-list">
        <li 
          v-for="notification in notifications" 
          :key="notification.id" 
          :class="{ unread: !notification.isRead }"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="notification-content">
            <p class="notification-text">{{ notification.text }}</p>
            <div class="notification-meta">
              <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
              <span class="notification-date">{{ formatDate(notification.timestamp) }}</span>
            </div>
          </div>
          <span v-if="!notification.isRead" class="unread-indicator"></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    
    const notifications = computed(() => store.getters.getNotificationsForCurrentUser);
    
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      });
    };
    
    const formatTime = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    const getNotificationIcon = (type) => {
      const icons = {
        message: 'bi-chat-square-text',
        booking: 'bi-calendar-check',
        system: 'bi-info-circle'
      };
      return `bi ${icons[type] || 'bi-bell'}`;
    };
    
    const markAsRead = (notificationId) => {
      store.dispatch('markNotificationAsRead', notificationId);
    };
    
    const markAllAsRead = () => {
      store.dispatch('markAllNotificationsAsRead');
    };
    
    return {
      notifications,
      formatDate,
      formatTime,
      getNotificationIcon,
      markAsRead,
      markAllAsRead
    };
  }
};
</script>

<style scoped lang="scss">
.notifications-page {
  padding: 2rem 0;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e9ecef;
    border-color: #ced4da;
  }
  
  i {
    font-size: 1.1rem;
  }
}

.no-notifications {
  text-align: center;
  padding: 3rem 0;
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #6c757d;
    
    i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    
    p {
      font-size: 1.1rem;
      margin: 0;
    }
  }
}

.notifications-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.notifications-list li {
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background-color: white;
  border-bottom: 1px solid #f1f3f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &.unread {
    background-color: #f8fbff;
    
    .notification-text {
      font-weight: 500;
      color: #2c3e50;
    }
  }
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9f5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1971c2;
  
  i {
    font-size: 1.2rem;
  }
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  margin: 0 0 0.5rem 0;
  color: #495057;
  line-height: 1.4;
  word-break: break-word;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #868e96;
}

.notification-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #adb5bd;
  }
}

.unread-indicator {
  position: absolute;
  top: 50%;
  right: 1.25rem;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #228be6;
}

@media (max-width: 576px) {
  .notifications-page {
    padding: 1rem 0;
  }
  
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .notifications-list li {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .notification-icon {
    width: 36px;
    height: 36px;
    
    i {
      font-size: 1rem;
    }
  }
}
</style>