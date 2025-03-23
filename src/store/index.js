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
        resourceId: 1, // Фотограф Иван
        date: '2025-03-17',
        time: '10:00',
        duration: 2,
        userId: 3, // Обычный пользователь
        isConfirmed: false, // Ожидает подтверждения
      },
    ],
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  },
  mutations: {
    SET_USERS(state, users) {
      state.users = users;
      localStorage.setItem('users', JSON.stringify(state.users));
    },
    ADD_USER(state, user) {
      user.id = Date.now();
      state.users.push(user);
      localStorage.setItem('users', JSON.stringify(state.users));
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex((user) => user.id === updatedUser.id);
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser);
        localStorage.setItem('users', JSON.stringify(state.users)); 
      }
    },
    REMOVE_USER(state, userId) {
      state.users = state.users.filter((user) => user.id !== userId);
      localStorage.setItem('users', JSON.stringify(state.users));
    },
    SET_RESOURCES(state, resources) {
      state.resources = resources;
    },
    ADD_BOOKING(state, booking) {
      const newBooking = { ...booking, id: Date.now() };
      state.bookings.push(newBooking);
      localStorage.setItem('bookings', JSON.stringify(state.bookings));
    },
    SET_CURRENT_USER(state, user) {
      state.currentUser = user;
    },
    REMOVE_BOOKING(state, bookingId) {
      state.bookings = state.bookings.filter((booking) => booking.id !== bookingId);
      localStorage.setItem('bookings', JSON.stringify(state.bookings));
    },
    ADD_RESOURCE(state, resource) {
      resource.id = Date.now();
      state.resources.push(resource);
      localStorage.setItem('resources', JSON.stringify(state.resources));
    },
    UPDATE_RESOURCE(state, updatedResource) {
      const index = state.resources.findIndex((resource) => resource.id === updatedResource.id);
      if (index !== -1) {
        state.resources.splice(index, 1, updatedResource);
        localStorage.setItem('resources', JSON.stringify(state.resources));
      }
    },
    REMOVE_RESOURCE(state, resourceId) {
      state.resources = state.resources.filter((resource) => resource.id !== resourceId);
      localStorage.setItem('resources', JSON.stringify(state.resources));
    },
    CONFIRM_BOOKING(state, bookingId) {
      const booking = state.bookings.find((booking) => booking.id === bookingId);
      if (booking) {
        booking.isConfirmed = true;
        localStorage.setItem('bookings', JSON.stringify(state.bookings));
      }
    },
    CANCEL_BOOKING(state, bookingId) {
      const booking = state.bookings.find((booking) => booking.id === bookingId);
      if (booking) {
        booking.isCancelled = true;
        localStorage.setItem('bookings', JSON.stringify(state.bookings));
      }
    },
  },
  actions: {
    login({ commit }, user) {
      commit('SET_CURRENT_USER', user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    },
    logout({ commit }) {
      commit('SET_CURRENT_USER', null);
      localStorage.removeItem('currentUser');
    },
    addBooking({ commit, state, getters }, booking) {
      const isBooked = getters.isResourceBooked(
        booking.resourceId,
        booking.date,
        booking.time,
        booking.duration
      );
  
      if (isBooked) {
        throw new Error('Этот слот уже занят!');
      } else {
        commit('ADD_BOOKING', booking);
      }
    },
    addResource({ commit }, resource) {
      commit('ADD_RESOURCE', resource);
    },
    updateResource({ commit }, resource) {
      commit('UPDATE_RESOURCE', resource);
    },
    removeResource({ commit }, resourceId) {
      commit('REMOVE_RESOURCE', resourceId);
    },
    addResource({ commit, state }, resource) {
      if (state.currentUser?.role === 'manager' && resource.type === state.currentUser.managedResourceType) {
        resource.managerId = state.currentUser.id;
      }
      commit('ADD_RESOURCE', resource);
    },
  },
  getters: {
    isAdmin: (state) => state.currentUser?.role === 'admin',
    isResourceManager: (state) => state.currentUser?.role === 'manager',
    isResourceBooked: (state) => (resourceId, date, time, duration) => {
      return state.bookings.some((booking) => {
        if (
          booking.resourceId === resourceId &&
          booking.date === date
        ) {
          const bookingStart = new Date(`${booking.date}T${booking.time}:00`);
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 60 * 1000);
  
          const newBookingStart = new Date(`${date}T${time}:00`);
          const newBookingEnd = new Date(newBookingStart.getTime() + duration * 60 * 60 * 1000);
  
          // Проверка на пересечение временных интервалов
          return (
            (newBookingStart >= bookingStart && newBookingStart < bookingEnd) || // Новое бронирование начинается во время существующего
            (newBookingEnd > bookingStart && newBookingEnd <= bookingEnd) || // Новое бронирование заканчивается во время существующего
            (newBookingStart <= bookingStart && newBookingEnd >= bookingEnd) // Новое бронирование полностью перекрывает существующее
          );
        }
        return false;
      });
    },
    getResourceNameById: (state) => (resourceId) => {
      const resource = state.resources.find((resource) => resource.id === resourceId);
      return resource ? resource.name : 'Неизвестный ресурс';
    },
    managedResources: (state) => {
      if (!state.currentUser || state.currentUser.role !== 'manager') return [];
      return state.resources.filter(
        (resource) =>
          resource.type === state.currentUser.managedResourceType && 
          resource.managerId === state.currentUser.id 
      );
    },
    pendingBookings: (state, getters) => {
      if (!state.currentUser || state.currentUser.role !== 'manager') return [];
      const managedResourceIds = getters.managedResources.map((resource) => resource.id);
      return state.bookings.filter(
        (booking) =>
          managedResourceIds.includes(booking.resourceId) &&
          !booking.isConfirmed 
      );
    },
    getUserNameById: (state) => (userId) => {
      const user = state.users.find((user) => user.id === userId);
      return user ? user.username : `Пользователь ${userId}`;
    },
  },
});

// Вспомогательная функция для добавления часов
function addHours(time, hours) {
  const [hour, minute] = time.split(':').map(Number);
  const totalMinutes = hour * 60 + minute + hours * 60;
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  return `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
}