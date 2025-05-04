<template>
  <div class="notifications-page">
    <div class="container">
      <div class="notifications-header">
        <h1 class="page-title">Уведомления</h1>
        <button @click="markAllAsRead" class="mark-all-btn" v-if="notifications.length > 0">
          <i class="bi bi-check-all"></i> Отметить все как прочитанные
        </button>
      </div>
      
      <div v-if="notifications.length === 0" class="no-notifications">
        <div class="empty-state">
          <i class="bi bi-bell-slash"></i>
          <p>У вас нет уведомлений</p>
        </div>
      </div>
      
      <ul class="notifications-list" v-else>
        <li 
          v-for="notification in sortedNotifications" 
          :key="notification.id" 
          :class="{ unread: !notification.isRead }"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon" :class="getNotificationIconClass(notification.type)">
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
import { useToast } from 'vue-toastification';

export default {
  setup() {
    const store = useStore();
    const toast = useToast();
    
    const notifications = computed(() => {
      return store.getters['notifications/getNotificationsForCurrentUser'] || [];
    });
    
    const sortedNotifications = computed(() => {
      return [...notifications.value].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    });
    
    const formatDate = (dateStr) => {
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long'
        });
      } catch {
        return dateStr;
      }
    };
    
    const formatTime = (dateStr) => {
      try {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return dateStr;
      }
    };
    
    const getNotificationIcon = (type) => {
      const icons = {
        'new-booking': 'bi-calendar-plus',
        'booking-confirmed': 'bi-calendar-check',
        'booking-cancelled': 'bi-calendar-x',
        'manager-confirmation': 'bi-person-check',
        'booking-cancelled-manager': 'bi-person-x',
        'message': 'bi-chat-text',
        'system': 'bi-info-circle'
      };
      return `bi ${icons[type] || 'bi-bell'}`;
    };
    
    const getNotificationIconClass = (type) => {
      const classes = {
        'new-booking': 'new-booking',
        'booking-confirmed': 'confirmed',
        'booking-cancelled': 'cancelled',
        'manager-confirmation': 'info',
        'booking-cancelled-manager': 'warning',
        'message': 'message',
        'system': 'system'
      };
      return classes[type] || 'default';
    };
    
    const markAsRead = (notificationId) => {
      try {
        store.commit('notifications/MARK_NOTIFICATION_AS_READ', notificationId);
      } catch (error) {
        toast.error('Не удалось отметить уведомление как прочитанное');
        console.error(error);
      }
    };
    
    const markAllAsRead = () => {
      try {
        store.commit('notifications/MARK_ALL_NOTIFICATIONS_AS_READ');
        toast.success('Все уведомления отмечены как прочитанные');
      } catch (error) {
        toast.error('Не удалось отметить все уведомления как прочитанные');
        console.error(error);
      }
    };
    
    return {
      notifications,
      sortedNotifications,
      formatDate,
      formatTime,
      getNotificationIcon,
      getNotificationIconClass,
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
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    font-size: 1.2rem;
  }
  
  &.new-booking {
    background-color: #e7f5ff;
    color: #228be6;
  }
  
  &.confirmed {
    background-color: #ebfbee;
    color: #2b8a3e;
  }
  
  &.cancelled {
    background-color: #fff5f5;
    color: #e03131;
  }
  
  &.info {
    background-color: #e7f5ff;
    color: #1971c2;
  }
  
  &.warning {
    background-color: #fff9db;
    color: #e67700;
  }
  
  &.message {
    background-color: #f3f0ff;
    color: #5f3dc4;
  }
  
  &.system {
    background-color: #f8f9fa;
    color: #495057;
  }
  
  &.default {
    background-color: #f8f9fa;
    color: #495057;
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