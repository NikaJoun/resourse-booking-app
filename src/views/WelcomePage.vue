<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Добро пожаловать!</h1>
      <form @submit.prevent="login" class="auth-form">
        <div class="form-group mb-3">
          <label for="username" class="form-label">Логин</label>
          <input
            type="text"
            class="form-control"
            id="username"
            v-model="username"
            placeholder="Введите логин"
          />
        </div>
        <div class="form-group mb-4">
          <label for="password" class="form-label">Пароль</label>
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="password"
            placeholder="Введите пароль"
          />
        </div>
        <button type="submit" class="btn btn-primary w-100">Войти</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();
    const username = ref('');
    const password = ref('');

    const login = () => {
      const user = store.state.users.find(
        (u) => u.username === username.value && u.password === password.value
      );

      if (user) {
        store.dispatch('login', user);
        router.push('/booking');
      } else {
        alert('Неверный логин или пароль');
      }
    };

    return {
      username,
      password,
      login,
    };
  },
};
</script>

<style lang="scss" scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 100vh;
  margin-top: 10vh;
  padding: 1rem;
}

.auth-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #343a40;
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-form {
  .form-group {
    margin-bottom: 1.5rem;

    .form-label {
      font-size: 1rem;
      font-weight: 500;
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 8px;
      font-size: 1rem;
      color: #495057;
      transition: border-color 0.3s ease;

      &:focus {
        border-color: #80bdff;
        outline: none;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }
    }
  }

  .btn-primary {
    background-color: #007bff;
    border: none;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 8px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #0056b3;
    }
  }
}
</style>