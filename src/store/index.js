import { createStore } from 'vuex';

export default createStore({
  state: {
    users: [
      { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
      { id: 2, username: 'manager', password: 'manager123', role: 'manager', managedResourceType: 'photographer' },
      { id: 3, username: 'user', password: 'user123', role: 'user' },
    ],
    resources: JSON.parse(localStorage.getItem('resources')) || [
      { id: 1, name: 'Фотограф Иван', type: 'photographer', managerId: 2 },
      { id: 2, name: 'Конференц-зал №1', type: 'conference_room', managerId: null },
      { id: 3, name: 'Проектор', type: 'equipment', managerId: null },
    ],
    bookings: JSON.parse(localStorage.getItem('bookings')) || [
      {
        id: 1,
        resourceId: 1,
        date: '2025-03-17',
        time: '10:00',
        duration: 2,
        userId: 3,
        isConfirmed: false,
      },
    ],
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    messages: JSON.parse(localStorage.getItem('messages')) || [],
    groupMessages: JSON.parse(localStorage.getItem('groupMessages')) || [],
    notifications: JSON.parse(localStorage.getItem('notifications')) || [],
  },

  mutations: {
    SET_USERS(state, users) {
      state.users = users;
      localStorage.setItem('users', JSON.stringify(users));
    },
    ADD_USER(state, user) {
      user.id = Date.now();
      state.users.push(user);
      localStorage.setItem('users', JSON.stringify(state.users));
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex(user => user.id === updatedUser.id);
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser);
        localStorage.setItem('users', JSON.stringify(state.users));
      }
    },
    REMOVE_USER(state, userId) {
      state.users = state.users.filter(user => user.id !== userId);
      localStorage.setItem('users', JSON.stringify(state.users));
    },

    SET_RESOURCES(state, resources) {
      state.resources = resources;
      localStorage.setItem('resources', JSON.stringify(resources));
    },
    ADD_RESOURCE(state, resource) {
      resource.id = Date.now();
      state.resources.push(resource);
      localStorage.setItem('resources', JSON.stringify(state.resources));
    },
    UPDATE_RESOURCE(state, updatedResource) {
      const index = state.resources.findIndex(r => r.id === updatedResource.id);
      if (index !== -1) {
        state.resources.splice(index, 1, updatedResource);
        localStorage.setItem('resources', JSON.stringify(state.resources));
      }
    },
    REMOVE_RESOURCE(state, resourceId) {
      state.resources = state.resources.filter(r => r.id !== resourceId);
      localStorage.setItem('resources', JSON.stringify(state.resources));
    },

    SET_BOOKINGS(state, bookings) {
      state.bookings = bookings;
      localStorage.setItem('bookings', JSON.stringify(bookings));
    },
    ADD_BOOKING(state, booking) {
      const newBooking = { ...booking, id: Date.now() };
      state.bookings.push(newBooking);
      localStorage.setItem('bookings', JSON.stringify(state.bookings));
    },
    CONFIRM_BOOKING(state, bookingId) {
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.isConfirmed = true;
        localStorage.setItem('bookings', JSON.stringify(state.bookings));
      }
    },
    CANCEL_BOOKING(state, bookingId) {
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.isCancelled = true;
        localStorage.setItem('bookings', JSON.stringify(state.bookings));
      }
    },
    REMOVE_BOOKING(state, bookingId) {
      state.bookings = state.bookings.filter(b => b.id !== bookingId);
      localStorage.setItem('bookings', JSON.stringify(state.bookings));
    },

    SET_CURRENT_USER(state, user) {
      state.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
    },

    ADD_MESSAGE(state, message) {
      message.id = Date.now();
      message.timestamp = new Date().toISOString();
      state.messages.push(message);
      localStorage.setItem('messages', JSON.stringify(state.messages));
    },
    SET_MESSAGES(state, messages) {
      state.messages = messages;
      localStorage.setItem('messages', JSON.stringify(messages));
    },
    MARK_MESSAGES_AS_READ(state, { userId, currentUserId }) {
      state.messages = state.messages.map(msg =>
        msg.receiverId === currentUserId && msg.senderId === userId && !msg.isRead
          ? { ...msg, isRead: true }
          : msg
      );
      localStorage.setItem('messages', JSON.stringify(state.messages));
    },
    ADD_GROUP_MESSAGE(state, message) {
      message.id = Date.now();
      message.timestamp = new Date().toISOString();
      state.groupMessages.push(message);
      localStorage.setItem('groupMessages', JSON.stringify(state.groupMessages));
    },
    SET_GROUP_MESSAGES(state, messages) {
      state.groupMessages = messages;
      localStorage.setItem('groupMessages', JSON.stringify(messages));
    },
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
    login({ commit }, user) {
      commit('SET_CURRENT_USER', user);
    },
    logout({ commit }) {
      commit('SET_CURRENT_USER', null);
    },
    addBooking({ commit, state }, booking) {
      commit('ADD_BOOKING', booking);
      const resource = state.resources.find(r => r.id === booking.resourceId);
      const user = state.users.find(u => u.id === booking.userId);
      
      if (resource?.managerId) {
        commit('ADD_NOTIFICATION', {
          userId: resource.managerId,
          text: `Новое бронирование "${resource?.name || 'ресурс'}" на ${booking.date} в ${booking.time} от ${user?.username || 'неизвестный'}.`,
          type: 'new-booking'
        });
      }
    },
    addResource({ commit, state }, resource) {
      if (state.currentUser?.role === 'manager' && resource.type === state.currentUser.managedResourceType) {
        resource.managerId = state.currentUser.id;
      }
      commit('ADD_RESOURCE', resource);
    },
    updateResource({ commit }, resource) {
      commit('UPDATE_RESOURCE', resource);
    },
    removeResource({ commit }, resourceId) {
      commit('REMOVE_RESOURCE', resourceId);
    },
    confirmBooking({ commit, state }, bookingId) {
      commit('CONFIRM_BOOKING', bookingId);
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        const resource = state.resources.find(r => r.id === booking.resourceId);
        const user = state.users.find(u => u.id === booking.userId);
        
        // Уведомление для пользователя
        commit('ADD_NOTIFICATION', {
          userId: booking.userId,
          text: `Ваше бронирование "${resource?.name || 'ресурс'}" на ${booking.date} в ${booking.time} подтверждено.`,
          type: 'booking-confirmed'
        });
        
        // Уведомление для менеджера (если есть)
        if (resource?.managerId) {
          commit('ADD_NOTIFICATION', {
            userId: resource.managerId,
            text: `Вы подтвердили бронирование "${resource?.name || 'ресурс'}" пользователем ${user?.username || 'неизвестный'}.`,
            type: 'manager-confirmation'
          });
        }
      }
    },
    cancelBooking({ commit, state }, bookingId) {
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        commit('CANCEL_BOOKING', bookingId);
        const resource = state.resources.find(r => r.id === booking.resourceId);
        const user = state.users.find(u => u.id === booking.userId);
        
        commit('ADD_NOTIFICATION', {
          userId: booking.userId,
          text: `Ваше бронирование "${resource?.name || 'ресурс'}" на ${booking.date} в ${booking.time} отменено.`,
          type: 'booking-cancelled'
        });
        
        if (resource?.managerId) {
          commit('ADD_NOTIFICATION', {
            userId: resource.managerId,
            text: `Подтвержденное бронирование "${resource?.name || 'ресурс'}" отменено пользователем ${user?.username || 'неизвестный'}.`,
            type: 'booking-cancelled-manager'
          });
        }
      }
    },

    async sendMessage({ commit }, message) {
      commit('ADD_MESSAGE', message);
    },
    async sendGroupMessage({ commit }, message) {
      commit('ADD_GROUP_MESSAGE', message);
    },
    async fetchMessages({ commit }) {
      const messages = JSON.parse(localStorage.getItem('messages')) || [];
      commit('SET_MESSAGES', messages);
    },
    async fetchGroupMessages({ commit }) {
      const messages = JSON.parse(localStorage.getItem('groupMessages')) || [];
      commit('SET_GROUP_MESSAGES', messages);
    },
    markMessagesAsRead({ commit, state }, userId) {
      if (state.currentUser) {
        commit('MARK_MESSAGES_AS_READ', {
          userId,
          currentUserId: state.currentUser.id,
        });
      }
    },
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification);
    },
    markNotificationAsRead({ commit }, notificationId) {
      commit('MARK_NOTIFICATION_AS_READ', notificationId);
    },
    markAllNotificationsAsRead({ commit }) {
      commit('MARK_ALL_NOTIFICATIONS_AS_READ');
    },
  },

  getters: {
    isAdmin: state => state.currentUser?.role === 'admin',
    isResourceManager: state => state.currentUser?.role === 'manager',

    isResourceBooked: state => (resourceId, date, time, duration) => {
      return state.bookings.some(booking => {
        if (booking.resourceId === resourceId && booking.date === date) {
          const bookingStart = new Date(`${booking.date}T${booking.time}:00`);
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 60 * 1000);
          const newStart = new Date(`${date}T${time}:00`);
          const newEnd = new Date(newStart.getTime() + duration * 60 * 60 * 1000);
          return (
            (newStart >= bookingStart && newStart < bookingEnd) ||
            (newEnd > bookingStart && newEnd <= bookingEnd) ||
            (newStart <= bookingStart && newEnd >= bookingEnd)
          );
        }
        return false;
      });
    },

    getResourceNameById: state => resourceId => {
      const resource = state.resources.find(r => r.id === resourceId);
      return resource ? resource.name : 'Неизвестный ресурс';
    },

    managedResources: state => {
      if (!state.currentUser || state.currentUser.role !== 'manager') return [];
      return state.resources.filter(
        r => r.type === state.currentUser.managedResourceType && r.managerId === state.currentUser.id
      );
    },

    pendingBookings: (state, getters) => {
      if (!state.currentUser || state.currentUser.role !== 'manager') return [];
      const managedResourceIds = getters.managedResources.map(r => r.id);
      return state.bookings.filter(b => managedResourceIds.includes(b.resourceId) && !b.isConfirmed);
    },

    getUserNameById: state => userId => {
      const user = state.users.find(u => u.id === userId);
      return user ? user.username : `Пользователь ${userId}`;
    },

    getMessagesForUser: state => userId => {
      const currentUserId = state.currentUser?.id;
      if (!currentUserId) return [];
      return state.messages
        .filter(
          m =>
            (m.senderId === currentUserId && m.receiverId === userId) ||
            (m.senderId === userId && m.receiverId === currentUserId)
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    getOtherUsers: state => {
      const currentUserId = state.currentUser?.id;
      return currentUserId ? state.users.filter(u => u.id !== currentUserId) : [];
    },

    getLastMessageForUser: (state, getters) => userId => {
      const messages = getters.getMessagesForUser(userId);
      return messages.length > 0 ? messages[messages.length - 1] : null;
    },

    getUnreadCountForUser: (state, getters) => userId => {
      const messages = getters.getMessagesForUser(userId);
      return messages.filter(m => m.receiverId === state.currentUser?.id && !m.isRead).length;
    },

    getGroupMessages: state => {
      return state.groupMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    getTotalUnreadCount: state => {
      return state.messages.filter(m => m.receiverId === state.currentUser?.id && !m.isRead).length;
    },

    getNotificationsForCurrentUser: state => {
      if (!state.currentUser) return [];
      return state.notifications
        .filter(n => n.userId === state.currentUser.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    getUnreadNotificationCount: (state, getters) => {
      return getters.getNotificationsForCurrentUser.filter(n => !n.isRead).length;
    },
  },
});
