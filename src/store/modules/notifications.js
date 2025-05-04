export default {
    namespaced: true,
    state: {
      notifications: JSON.parse(localStorage.getItem('notifications')) || [],
    },
    mutations: {
      ADD_NOTIFICATION(state, notification) {
        notification.id = Date.now();
        notification.timestamp = new Date().toISOString();
        notification.isRead = false;
        state.notifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(state.notifications));
      },
      MARK_NOTIFICATION_AS_READ(state, notificationId) {
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
          localStorage.setItem('notifications', JSON.stringify(state.notifications));
        }
      },
      MARK_ALL_NOTIFICATIONS_AS_READ(state) {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        localStorage.setItem('notifications', JSON.stringify(state.notifications));
      },
    },
    actions: {
      markAllNotificationsAsRead({ commit }) {
        commit('MARK_ALL_NOTIFICATIONS_AS_READ')
      },
      markNotificationAsRead({ commit }, notificationId) {
        commit('MARK_NOTIFICATION_AS_READ', notificationId)
      }
    },
    getters: {
      getNotificationsForCurrentUser: (state, getters, rootState) => {
        const userId = rootState.auth.currentUser?.id
        if (!userId) return []
        
        return state.notifications
          .filter(n => n.userId === userId)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      },
      getUnreadNotificationCount: (state, getters) => {
        return getters.getNotificationsForCurrentUser.filter(n => !n.isRead).length;
      },
    },
  };