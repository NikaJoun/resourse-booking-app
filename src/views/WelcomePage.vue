<template>
  <div class="auth-page">
    <AuthCard 
      @submit="login"
      :loading="loading"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import AuthCard from '@/components/auth/AuthCard.vue';

export default {
  components: { AuthCard },
  setup() {
    const store = useStore();
    const router = useRouter();
    const loading = ref(false);

    const login = async (credentials) => {
      loading.value = true;
      try {
        const user = store.state.users.users.find(
          u => u.username === credentials.username && 
               u.password === credentials.password
        );
        
        if (user) {
          await store.dispatch('auth/login', user);
          router.push('/booking');
        } else {
          throw new Error('Неверный логин или пароль');
        }
      } catch (error) {
        alert(error.message);
      } finally {
        loading.value = false;
      }
    };

    return { login, loading };
  }
};
</script>

<style lang="scss" scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 55vh;
  padding: 20px;
}
</style>