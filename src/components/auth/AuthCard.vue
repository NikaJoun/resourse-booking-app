<template>
  <div class="auth-card">
    <AuthHeader />
    
    <form @submit.prevent="handleSubmit" class="auth-form">
      <AuthInput
        v-model="form.username"
        label="Логин"
        type="text"
        required
      />
      
      <AuthInput
        v-model="form.password"
        label="Пароль"
        type="password"
        required
      />
      
      <AuthButton :loading="loading">
        Войти
      </AuthButton>
    </form>
  </div>
</template>

<script>
import { reactive } from 'vue';
import AuthHeader from '@/components/auth/AuthHeader.vue';
import AuthInput from '@/components/auth/AuthInput.vue';
import AuthButton from '@/components/auth/AuthButton.vue';

export default {
  components: { AuthHeader, AuthInput, AuthButton },
  props: {
    loading: Boolean
  },
  emits: ['submit'],
  setup(props, { emit }) {
    const form = reactive({
      username: '',
      password: ''
    });

    const handleSubmit = () => {
      emit('submit', { ...form });
    };

    return { form, handleSubmit };
  }
};
</script>

<style lang="scss" scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 30px 20px;
  }
}
</style>