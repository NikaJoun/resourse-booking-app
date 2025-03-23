import { createRouter, createWebHistory } from 'vue-router';
import WelcomePage from '@/views/WelcomePage.vue';
import BookingPage from '@/views/BookingPage.vue';
import ProfilePage from '@/views/ProfilePage.vue';
import AdminPanel from '@/views/AdminPanel.vue';
import ManagerResourcesPage from '@/views/ManagerResourcesPage.vue';
import FullCalendar from '@/views/FullCalendar.vue';
import store from '@/store';

const routes = [
  { path: '/', component: WelcomePage },
  { path: '/calendar', component: FullCalendar },
  {
    path: '/booking',
    component: BookingPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/manager/resources',
    component: ManagerResourcesPage,
    meta: { requiresAuth: true, role: 'manager' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.currentUser !== null;
  const isAdmin = store.getters.isAdmin;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/');
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/booking');
  } else {
    next();
  }
});

export default router;