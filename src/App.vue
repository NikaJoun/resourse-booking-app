<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand">
          <span class="app-name">РесурсБук</span>
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
              <li class="nav-item dropdown me-2">
                <a
                  class="nav-link position-relative"
                  href="#"
                  id="notificationDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="bi bi-bell"></i>
                  <span v-if="unreadNotificationCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {{ unreadNotificationCount }}
                  </span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end notification-dropdown" aria-labelledby="notificationDropdown">
                  <li v-if="notifications.length === 0" class="dropdown-item text-muted">Нет уведомлений</li>
                  <li v-for="(n, index) in notifications.slice(0, 5)" :key="index" class="dropdown-item notification-item" :class="{ 'unread': !n.isRead }">
                    <div @click="markAsRead(n.id)">
                      <p class="notification-text">{{ n.text }}</p>
                      <small class="notification-time">{{ formatNotificationTime(n.timestamp) }}</small>
                    </div>
                  </li>
                  <li>
                    <router-link to="/notifications" class="dropdown-item text-center text-primary" @click="markAllAsRead">
                      Показать все уведомления
                    </router-link>
                  </li>
                </ul>
              </li>

              <li class="nav-item">
                <router-link to="/profile" class="nav-link">Профиль</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/calendar" class="nav-link">Календарь</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/booking" class="nav-link">Бронирование</router-link>
              </li>
              <li v-if="isManager" class="nav-item">
                <router-link to="/manager/resources" class="nav-link">Управление ресурсами</router-link>
              </li>
              <li v-if="isAdmin" class="nav-item">
                <router-link to="/admin" class="nav-link">Админка</router-link>
              </li>
              <li class="nav-item">
                <a @click="logout" class="nav-link">Выйти</a>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <button 
      v-if="isAuthenticated"
      @click="toggleMessenger"
      class="messenger-btn"
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

    <footer class="footer">
      <div class="container">
        <span class="footer-text">by NikaJoun</span>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Messenger from '@/components/Messenger.vue';
import { useToast } from 'vue-toastification';

export default {
  components: { Messenger },
  setup() {
    const store = useStore();
    const router = useRouter();
    const isMessengerOpen = ref(false);
    const toast = useToast();

    const isAuthenticated = computed(() => store.state.currentUser !== null);
    const isManager = computed(() => store.state.currentUser?.role === 'manager');
    const isAdmin = computed(() => store.state.currentUser?.role === 'admin');
    
    const unreadCount = computed(() => {
      if (!isAuthenticated.value) return 0;
      const currentUserId = store.state.currentUser.id;
      return (store.state.messages || []).filter(
        m => m.receiverId === currentUserId && !m.isRead
      ).length;
    });

    const notifications = computed(() => store.getters.getNotificationsForCurrentUser);
    const unreadNotificationCount = computed(() => store.getters.getUnreadNotificationCount);

    const formatNotificationTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    const markAsRead = (notificationId) => {
      store.dispatch('markNotificationAsRead', notificationId);
    };
    
    const markAllAsRead = () => {
      store.dispatch('markAllNotificationsAsRead');
    };

    const logout = async () => {
      await store.dispatch('logout');
      router.push('/');
      isMessengerOpen.value = false;
    };

    const toggleMessenger = () => {
      isMessengerOpen.value = !isMessengerOpen.value;
      if (isMessengerOpen.value) {
        store.dispatch('markMessagesAsRead');
      }
    };

    watch(isAuthenticated, (newVal) => {
      if (!newVal) {
        isMessengerOpen.value = false;
      }
    });

    watch(
      () => store.state.bookings,
      (newBookings, oldBookings) => {
        if (!oldBookings) return;

        const currentUserId = store.state.currentUser?.id;
        newBookings.forEach(booking => {
          const old = oldBookings.find(b => b.id === booking.id);
          if (
            booking.status === 'confirmed' &&
            old?.status !== 'confirmed' &&
            booking.userId === currentUserId
          ) {
            const msg = 'Ваше бронирование подтверждено!';
            notifications.value.push(msg);
            toast.success(msg);
          }
        });
      },
      { deep: true }
    );

    watch(
      () => store.state.messages,
      (newMessages, oldMessages) => {
        if (!oldMessages) return;

        const currentUserId = store.state.currentUser?.id;
        const newIncoming = newMessages.filter(
          m =>
            m.receiverId === currentUserId &&
            !oldMessages.some(om => om.id === m.id)
        );

        if (newIncoming.length > 0 && !isMessengerOpen.value) {
          const msg = `Новое сообщение от ${newIncoming[0].senderName}`;
          notifications.value.push(msg);
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
      notifications,
      unreadNotificationCount,
      formatNotificationTime,
      markAsRead,
      markAllAsRead,
      logout,
      toggleMessenger,
    };
  },
};
</script>

<style lang="scss">
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #cacaca, #e5e5e5);
  position: relative;
}

.navbar {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .navbar-brand {
    .app-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
    }
  }

  .nav-link {
    font-size: 1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.75);
    transition: color 0.3s ease;
    cursor: pointer;

    &:hover {
      color: #ffffff;
    }

    &.router-link-exact-active {
      color: #ffffff;
      font-weight: 600;
    }
  }

  .bi-bell {
    font-size: 1.2rem;
  }
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background-color: rgba(59, 60, 61, 0.8);
  color: #ffffff;
  padding: 1rem 0;
  text-align: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

  .footer-text {
    font-size: 0.9rem;
    font-weight: 400;
  }
}

.messenger-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: all 0.3s ease;

  &:hover {
    background-color: #0069d9;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }

  &.has-unread {
    animation: pulse 1.5s infinite;
  }

  .unread-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #dc3545;
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

.notification-dropdown {
  width: 350px;
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-text {
  margin-bottom: 0.25rem;
  color: #333;
}

.notification-time {
  color: #6c757d;
  font-size: 0.8rem;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .messenger-btn {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 1.3rem;
  }
}
</style>