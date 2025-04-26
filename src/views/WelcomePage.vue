<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Добро пожаловать</h1>
          <p>Пожалуйста, войдите в свой аккаунт</p>
        </div>
        
        <form @submit.prevent="login" class="auth-form">
          <div class="form-group">
            <input
              type="text"
              class="form-input"
              v-model="username"
              placeholder=" "
              required
            />
            <label>Логин</label>
          </div>
          
          <div class="form-group">
            <input
              type="password"
              class="form-input"
              v-model="password"
              placeholder=" "
              required
            />
            <label>Пароль</label>
          </div>
          
          <button type="submit" class="auth-button">
            Войти
          </button>
        </form>
      </div>
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
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    font-size: 24px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }
  
  p {
    font-size: 14px;
    color: #777;
    margin: 0;
  }
}

.auth-form {
  .form-group {
    position: relative;
    margin-bottom: 24px;
    
    .form-input {
      width: 100%;
      padding: 14px 16px;
      font-size: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:focus {
        border-color: #a0a0a0;
        background: white;
        outline: none;
        box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.1);
      }
      
      &:not(:placeholder-shown) + label,
      &:focus + label {
        transform: translateY(-24px) scale(0.9);
        background: white;
        padding: 0 4px;
        left: 12px;
        color: #555;
      }
    }
    
    label {
      position: absolute;
      left: 16px;
      top: 14px;
      color: #999;
      font-size: 16px;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
}

.auth-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(107, 115, 255, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(107, 115, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 30px 20px;
  }
  
  .auth-header h1 {
    font-size: 20px;
  }
}
</style>