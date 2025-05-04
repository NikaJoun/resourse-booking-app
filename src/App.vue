<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <span class="app-name">
            <i class="bi bi-bookmark-check me-2"></i>
            РесурсБук
          </span>
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <template v-if="isAuthenticated">
              <li class="nav-item">
                <router-link to="/profile" class="nav-link">
                  <i class="bi bi-person me-1"></i>Профиль
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/calendar" class="nav-link">
                  <i class="bi bi-calendar3 me-1"></i>Календарь
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/booking" class="nav-link">
                  <i class="bi bi-journal-check me-1"></i>Бронирование
                </router-link>
              </li>
              <li v-if="isManager" class="nav-item">
                <router-link to="/manager/resources" class="nav-link">
                  <i class="bi bi-gear me-1"></i>Ресурсы
                </router-link>
              </li>
              <li v-if="isAdmin" class="nav-item">
                <router-link to="/admin" class="nav-link">
                  <i class="bi bi-shield-lock me-1"></i>Админка
                </router-link>
              </li>
              <li class="nav-item">
                <a @click="logout" class="nav-link">
                  <i class="bi bi-box-arrow-right me-1"></i>Выйти
                </a>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <div class="container">
        <router-view />
      </div>
    </main>

    <button 
      v-if="isAuthenticated"
      @click="toggleNotificationModal"
      class="notification-tab"
      :class="{ 'has-unread': unreadNotificationCount > 0 }"
    >
      <i class="bi bi-bell"></i>
      <span v-if="unreadNotificationCount > 0" class="unread-badge">{{ unreadNotificationCount }}</span>
    </button>

    <button 
      v-if="isAuthenticated"
      @click="toggleMessenger"
      class="floating-btn messenger-btn"
      :class="{ 'has-unread': unreadCount > 0 }"
    >
      <i class="bi bi-chat-dots"></i>
      <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
    </button>

    <Messenger 
      v-if="isAuthenticated"
      :isOpen="isMessengerOpen" 
      @close="toggleMessenger"
    />

    <NotificationModal
      :isOpen="isNotificationModalOpen"
      :notifications="notifications"
      :unreadCount="unreadNotificationCount"
      @close="isNotificationModalOpen = false"
    />

    <footer class="footer">
      <div class="container">
        <span class="footer-text">
          <i class="bi bi-code-slash me-2"></i>by NikaJoun
        </span>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Messenger from '@/components/Messenger.vue';
import NotificationModal from '@/components/NotificationModal.vue';
import { useToast } from 'vue-toastification';

export default {
  components: { Messenger, NotificationModal },
  setup() {
    const store = useStore();
    const router = useRouter();
    const isMessengerOpen = ref(false);
    const isNotificationModalOpen = ref(false);
    const toast = useToast();

    const isAuthenticated = computed(() => store.state.auth.currentUser !== null);
    const isManager = computed(() => store.state.auth.currentUser?.role === 'manager');
    const isAdmin = computed(() => store.getters['auth/isAdmin']);
    
    const unreadCount = computed(() => {
      if (!isAuthenticated.value) return 0;
      return store.getters['messages/getTotalUnreadCount'];
    });

    const notifications = computed(() => store.getters['notifications/getNotificationsForCurrentUser']);
    const unreadNotificationCount = computed(() => store.getters['notifications/getUnreadNotificationCount']);

    const formatNotificationTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    const markAsRead = (notificationId) => {
      store.dispatch('notifications/markNotificationAsRead', notificationId);
    };
    
    const markAllAsRead = () => {
      store.dispatch('notifications/markAllNotificationsAsRead');
    };

    const logout = async () => {
      await store.dispatch('auth/logout');
      router.push('/');
      isMessengerOpen.value = false;
      isNotificationModalOpen.value = false;
    };

    const toggleMessenger = () => {
      isMessengerOpen.value = !isMessengerOpen.value;
      if (isMessengerOpen.value) {
        const currentUserId = store.state.auth.currentUser?.id;
        if (currentUserId) {
          store.dispatch('messages/markMessagesAsRead', currentUserId);
        }
      }
    };

    const toggleNotificationModal = () => {
      isNotificationModalOpen.value = !isNotificationModalOpen.value;
    };

    const handleViewAll = () => {
      markAllAsRead();
      isNotificationModalOpen.value = false;
      router.push('/notifications');
    };

    watch(isAuthenticated, (newVal) => {
      if (!newVal) {
        isMessengerOpen.value = false;
        isNotificationModalOpen.value = false;
      }
    });

    watch(
      () => store.state.bookings.bookings,
      (newBookings, oldBookings) => {
        if (!oldBookings) return;

        const currentUserId = store.state.auth.currentUser?.id;
        newBookings.forEach(booking => {
          const old = oldBookings.find(b => b.id === booking.id);
          if (
            booking.isConfirmed &&
            !old?.isConfirmed &&
            booking.userId === currentUserId
          ) {
            const msg = 'Ваше бронирование подтверждено!';
            store.dispatch('notifications/ADD_NOTIFICATION', {
              userId: currentUserId,
              text: msg,
              type: 'booking'
            });
            toast.success(msg);
          }
        });
      },
      { deep: true }
    );

    watch(
      () => store.state.messages.messages,
      (newMessages, oldMessages) => {
        if (!oldMessages) return;

        const currentUserId = store.state.auth.currentUser?.id;
        const newIncoming = newMessages.filter(
          m =>
            m.receiverId === currentUserId &&
            !oldMessages.some(om => om.id === m.id)
        );

        if (newIncoming.length > 0 && !isMessengerOpen.value) {
          const sender = store.getters['users/getUserById'](newIncoming[0].senderId);
          const msg = `Новое сообщение от ${sender?.username || 'пользователя'}`;
          store.dispatch('notifications/ADD_NOTIFICATION', {
            userId: currentUserId,
            text: msg,
            type: 'message'
          });
          toast.info(msg);
        }
      },
      { deep: true }
    );

    return {
      isAuthenticated,
      isManager,
      isAdmin,
      unreadCount,
      isMessengerOpen,
      isNotificationModalOpen,
      notifications,
      unreadNotificationCount,
      formatNotificationTime,
      markAsRead,
      markAllAsRead,
      logout,
      toggleMessenger,
      toggleNotificationModal,
      handleViewAll,
    };
  },
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css');

:root {
  --primary-color: #4e73df;
  --secondary-color: #f8f9fc;
  --accent-color: #2e59d9;
  --dark-color: #2c3e50;
  --light-color: #ffffff;
  --success-color: #1cc88a;
  --warning-color: #f6c23e;
  --danger-color: #e74a3b;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--dark-color);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fc, #e5e8f0);
  position: relative;
}

.navbar {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  box-shadow: var(--shadow);
  padding: 0.8rem 0;

  .container {
    max-width: 1200px;
  }

  .navbar-brand {
    .app-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--light-color);
      display: flex;
      align-items: center;
    }
  }

  .nav-link {
    font-size: 0.95rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
    transition: var(--transition);
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    margin: 0 0.2rem;
    border-radius: 0.3rem;

    &:hover {
      color: var(--light-color);
      background-color: rgba(255, 255, 255, 0.1);
    }

    &.router-link-exact-active {
      color: var(--light-color);
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }

    i {
      font-size: 1.1rem;
    }
  }
}

.main-content {
  flex: 1;
  padding: 2rem;

  .container {
    max-width: 1200px;
    background-color: var(--light-color);
    border-radius: 0.5rem;
    box-shadow: var(--shadow);
    padding: 2rem;
  }
}

.footer {
  background: linear-gradient(135deg, var(--dark-color), #1a1a2e);
  color: var(--light-color);
  padding: 1.2rem;
  text-align: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  margin-top: .5rem;

  .footer-text {
    font-size: 0.9rem;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 1.1rem;
    }
  }
}

.floating-btn {
  position: fixed;
  bottom: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: var(--shadow);
  z-index: 1000;
  transition: var(--transition);

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }

  &.has-unread {
    animation: pulse 1.5s infinite;
  }

  .unread-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: var(--danger-color);
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
  }
}

.notification-tab {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%) translateX(-50%);
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f6c23e, #f5b301);
  color: white;
  border: none;
  border-radius: 0 50% 50% 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: all 0.3s ease;
  padding-left: 10px;
  
  &:hover {
    transform: translateY(-50%) translateX(-30%);
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);
  }
  
  &.has-unread {
    animation: pulse 1.5s infinite;
  }

  .unread-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #e74a3b;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
  }
}

.messenger-btn {
  right: 30px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));

  &:hover {
    background: linear-gradient(135deg, var(--accent-color), #1a4fd9);
  }
}

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

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.6rem 0;

    .nav-link {
      padding: 0.5rem;
      margin: 0.1rem 0;
    }
  }

  .main-content {
    padding: 1rem 0;

    .container {
      padding: 1.5rem;
    }
  }

  .notification-modal-wrapper {
    left: 0;
    right: 0;
    width: 100%;
    
    &.show {
      transform: translateY(0);
    }
  }
  
  .floating-btn {
    bottom: 20px;
    width: 50px;
    height: 50px;
    font-size: 1.3rem;
  }
  
  .notification-tab {
    width: 50px;
    height: 50px;
    font-size: 1.3rem;
    padding-left: 8px;
    
    .unread-badge {
      width: 20px;
      height: 20px;
      font-size: 0.7rem;
    }
  }

  .messenger-btn {
    right: 20px;
  }
}
</style>