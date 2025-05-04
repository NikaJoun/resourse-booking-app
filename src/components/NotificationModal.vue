<template>
  <div>
    <div 
      class="modal-overlay" 
      :class="{ 'active': isOpen }"
      @click="close"
    ></div>
    
    <div class="notifications-wrapper" :class="{ 'is-open': isOpen }">
      <div class="modal-container">
        <header class="modal-header">
          <h3>
            <i class="bi bi-bell"></i> Уведомления
            <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
          </h3>
          <button @click="close" class="icon-btn"><i class="bi bi-x"></i></button>
        </header>

        <section class="modal-body">
          <template v-if="notifications.length === 0">
            <div class="empty">
              <i class="bi bi-bell-slash"></i>
              <p>Нет новых уведомлений</p>
            </div>
          </template>

          <ul v-else class="notification-list">
            <li
              v-for="n in notifications"
              :key="n.id"
              :class="['notification', { unread: !n.isRead }]"
              @click="markAsRead(n.id)"
            >
              <div :class="['icon', n.type]">
                <i :class="getIcon(n.type)"></i>
              </div>
              <div class="content">
                <p class="text">{{ n.text }}</p>
                <div class="meta">
                  <time>{{ formatTime(n.timestamp) }}</time>
                  <span v-if="!n.isRead" class="new">Новое</span>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <footer class="modal-footer">
          <button @click="markAllAsRead" :disabled="unreadCount === 0">
            <i class="bi bi-check-all"></i> Прочитать все
          </button>
          <router-link to="/notifications" @click="close">Смотреть все</router-link>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useStore } from 'vuex'

const store = useStore()

const props = defineProps({
  isOpen: Boolean,
  notifications: {
    type: Array,
    default: () => []
  },
  unreadCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

const close = () => emit('close')
const markAsRead = (id) => store.dispatch('notifications/markNotificationAsRead', id)
const markAllAsRead = () => store.dispatch('notifications/markAllNotificationsAsRead')

const getIcon = (type) => {
  const map = {
    'new-booking': 'bi-calendar-plus',
    'booking-confirmed': 'bi-calendar-check',
    'booking-cancelled': 'bi-calendar-x',
    'manager-confirmation': 'bi-person-check',
    'booking-cancelled-manager': 'bi-person-x',
    'message': 'bi-chat-text',
    'system': 'bi-info-circle'
  }
  return `bi ${map[type] || 'bi-bell'}`
}

const formatTime = (ts) => {
  try {
    return format(new Date(ts), 'HH:mm', { locale: ru })
  } catch {
    return ts
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.notifications-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 380px;
  max-width: 90%;
  z-index: 1050;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.notifications-wrapper.is-open {
  transform: translateX(0);
}

.modal-container {
  position: relative;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-header .icon-btn {
  color: #6b7280;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.modal-header .icon-btn:hover {
  color: #111827;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.empty i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty p {
  margin: 0;
  font-size: 1rem;
}

.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notification {
  display: flex;
  gap: 12px;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.notification:hover {
  background-color: #f9fafb;
}

.notification.unread {
  background-color: #f8fafc;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #4b5563;
}

.content {
  flex: 1;
  min-width: 0;
}

.text {
  margin: 0 0 6px;
  font-size: 0.95rem;
  color: #111827;
  line-height: 1.4;
}

.notification.unread .text {
  font-weight: 500;
}

.meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.8rem;
}

time {
  color: #9ca3af;
}

.new {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 500;
}

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}

.modal-footer button {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.25rem 0.5rem;
}

.modal-footer button:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.modal-footer a {
  color: #3b82f6;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
}

.badge {
  background: #ef4444;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 6px;
}

@media (max-width: 576px) {
  .notifications-wrapper {
    width: 85%;
  }
  
  .modal-header {
    padding: 0.75rem 1rem;
  }
  
  .notification {
    padding: 0.75rem 1rem;
  }
  
  .modal-footer {
    padding: 0.75rem 1rem;
  }
}
</style>