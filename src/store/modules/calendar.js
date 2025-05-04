export default {
    namespaced: true,
    state: () => ({
      selectedDate: new Date().toISOString().split('T')[0],
    }),
    mutations: {
      SET_DATE(state, date) {
        state.selectedDate = date;
      },
    },
    actions: {
      selectDate({ commit }, date) {
        commit('SET_DATE', date);
      },
    },
    getters: {
      currentDate: state => state.selectedDate,
    },
};