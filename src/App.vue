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

    <footer class="footer">
      <div class="container">
        <span class="footer-text">by NikaJoun</span>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();

    const isAuthenticated = computed(() => store.state.currentUser !== null);

    const isManager = computed(() => store.state.currentUser?.role === 'manager');

    const isAdmin = computed(() => store.state.currentUser?.role === 'admin');

    const logout = () => {
      store.dispatch('logout');
      router.push('/');
    };

    return {
      isAuthenticated,
      isManager,
      isAdmin,
      logout,
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
</style>