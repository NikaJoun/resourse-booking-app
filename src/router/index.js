import { createRouter, createWebHistory } from 'vue-router';
import WelcomePage from '@/views/WelcomePage.vue';
import BookingPage from '@/views/BookingPage.vue';
import ProfilePage from '@/views/ProfilePage.vue';
import AdminPanel from '@/views/AdminPanel.vue';
import store from '@/store';

const routes = [
  { path: '/', component: WelcomePage },
  {
    path: '/booking',
    component: BookingPage,
    meta: { requiresAuth: true }, // Требует авторизации
  },
  {
    path: '/profile',
    component: ProfilePage,
    meta: { requiresAuth: true }, // Требует авторизации
  },
  {
    path: '/admin',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true }, // Требует авторизации и роли админа
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Навигационный хук для проверки доступа
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.currentUser !== null;
  const isAdmin = store.getters.isAdmin;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Если пользователь не авторизован, перенаправляем на главную страницу
    next('/');
  } else if (to.meta.requiresAdmin && !isAdmin) {
    // Если пользователь не админ, перенаправляем на страницу бронирования
    next('/booking');
  } else {
    // Иначе разрешаем переход
    next();
  }
});

export default router;