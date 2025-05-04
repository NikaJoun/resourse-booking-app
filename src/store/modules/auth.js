export default {
    namespaced: true,
    state: {
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    },
    mutations: {
      SET_CURRENT_USER(state, user) {
        state.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
      },
    },
    actions: {
      login({ commit }, user) {
        commit('SET_CURRENT_USER', user);
      },
      logout({ commit }) {
        commit('SET_CURRENT_USER', null);
      },
    },
    getters: {
      isAdmin: state => state.currentUser?.role === 'admin',
      isResourceManager: state => state.currentUser?.role === 'manager',
      currentUser: state => state.currentUser,
      managedResourceType: state => state.currentUser?.managedResourceType || null

    },
};