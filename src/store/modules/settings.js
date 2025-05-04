export default {
    namespaced: true,
    state: {
      calendarSettings: JSON.parse(localStorage.getItem('calendarSettings')) || {
        lastExport: null
      },
    },
    mutations: {
      UPDATE_LAST_EXPORT(state) {
        state.calendarSettings.lastExport = new Date().toISOString();
        localStorage.setItem('calendarSettings', JSON.stringify(state.calendarSettings));
      },
    },
    getters: {
      lastExportDate: (state) => {
        return state.calendarSettings.lastExport 
          ? new Date(state.calendarSettings.lastExport).toLocaleString() 
          : 'никогда';
      },
    },
};