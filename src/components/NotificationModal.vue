<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Уведомления</h2>
          <button @click="markAllAsRead" class="mark-all-read">Отметить все как прочитанные</button>
        </div>
        
        <div v-if="notifications.length === 0" class="no-notifications">
          <p>Нет уведомлений</p>
        </div>
        
        <ul class="notification-list">
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
  import { mapGetters, mapActions } from 'vuex';
  
  export default {
    computed: {
      ...mapGetters(['getNotificationsForCurrentUser']),
      notifications() {
        return this.getNotificationsForCurrentUser;
      }
    },
    methods: {
      ...mapActions(['markNotificationAsRead', 'markAllNotificationsAsRead']),
      
      formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('ru-RU', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      
      markAsRead(notificationId) {
        this.markNotificationAsRead(notificationId);
      },
      
      markAllAsRead() {
        this.markAllNotificationsAsRead();
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
  }
  
  .modal-content {
    background: white;
    border-radius: 12px;
    width: 450px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  .modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #333;
  }
  
  .mark-all-read {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
  }
  
  .mark-all-read:hover {
    text-decoration: underline;
  }
  
  .no-notifications {
    padding: 2rem;
    text-align: center;
    color: #666;
  }
  
  .notification-list {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
  }
  
  .notification-list li {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .notification-list li:hover {
    background-color: #f8f9fa;
  }
  
  .notification-list li.unread {
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