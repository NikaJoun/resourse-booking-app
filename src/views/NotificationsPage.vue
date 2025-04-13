<template>
    <div class="notifications-page">
      <div class="container">
        <h1 class="page-title">Уведомления</h1>
        
        <div class="notifications-header">
          <button @click="markAllAsRead" class="btn btn-outline-primary">
            Отметить все как прочитанные
          </button>
        </div>
        
        <div v-if="notifications.length === 0" class="no-notifications">
          <p>У вас нет уведомлений</p>
        </div>
        
        <ul class="notifications-list">
          <li 
            v-for="notification in notifications" 
            :key="notification.id" 
            :class="{ unread: !notification.isRead }"
            @click="markAsRead(notification.id)"
          >
            <div class="notification-content">
              <p>{{ notification.text }}</p>
              <small>{{ formatDate(notification.timestamp) }}</small>
            </div>
            <span v-if="!notification.isRead" class="unread-dot"></span>
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
        return date.toLocaleString('ru-RU', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
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
        markAsRead,
        markAllAsRead
      };
    }
  };
  </script>
  
  <style scoped>
  .notifications-page {
    padding: 2rem 0;
  }
  
  .page-title {
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .notifications-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }
  
  .no-notifications {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
  
  .notifications-list {
    list-style: none;
    padding: 0;
    margin: 0;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .notifications-list li {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .notifications-list li:last-child {
    border-bottom: none;
  }
  
  .notifications-list li:hover {
    background-color: #f8f9fa;
  }
  
  .notifications-list li.unread {
    background-color: #f0f7ff;
  }
  
  .notification-content {
    flex: 1;
  }
  
  .notification-content p {
    margin: 0 0 0.25rem 0;
    color: #333;
  }
  
  .notification-content small {
    color: #666;
    font-size: 0.8rem;
  }
  
  .unread-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #007bff;
    margin-left: 1rem;
  }
  </style>