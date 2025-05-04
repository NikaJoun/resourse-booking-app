export default {
    namespaced: true,
    state: {
      users: JSON.parse(localStorage.getItem('users')) || [
        {
          id: 1,
          username: 'admin',
          password: 'admin123',
          role: 'admin'
        },
        {
          id: 2,
          username: 'manager',
          password: 'manager123',
          role: 'manager',
          managedResourceType: 'photographer'
        },
        {
          id: 3,
          username: 'user',
          password: 'user123',
          role: 'user'
        }
      ]
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
    },
    actions: {
      addUser({ commit }, user) {
          commit('ADD_USER', user);
      },
      updateUser({ commit }, user) {
          commit('UPDATE_USER', user);
      },
      removeUser({ commit }, userId) {
          commit('REMOVE_USER', userId);
      },
    },
    getters: {
      getUserById: state => userId => state.users.find(u => u.id === userId),
      getUserNameById: state => userId => {
        const user = state.users.find(u => u.id === userId);
        return user ? user.username : `Пользователь ${userId}`;
      },
      getOtherUsers: (state, getters, rootState) => {
        const currentUserId = rootState.auth.currentUser?.id;
        return currentUserId ? state.users.filter(u => u.id !== currentUserId) : [];
      },
    },
};