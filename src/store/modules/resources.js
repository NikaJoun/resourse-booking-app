export default {
    namespaced: true,
    state: {
      resources: JSON.parse(localStorage.getItem('resources')) || [
        { id: 1, name: 'Фотограф Иван', type: 'photographer', managerId: 2 },
        { id: 2, name: 'Конференц-зал №1', type: 'conference_room', managerId: null },
        { id: 3, name: 'Проектор', type: 'equipment', managerId: null },
      ],
    },
    mutations: {
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
    },
    actions: {
      addResource({ commit, rootState }, resource) {
        if (rootState.auth.currentUser?.role === 'manager' && 
            resource.type === rootState.auth.currentUser.managedResourceType) {
          resource.managerId = rootState.auth.currentUser.id;
        }
        commit('ADD_RESOURCE', resource);
      },
      updateResource({ commit }, resource) {
        commit('UPDATE_RESOURCE', resource);
      },
      removeResource({ commit }, resourceId) {
          commit('REMOVE_RESOURCE', resourceId);
      },
    },
    getters: {
      getResourceById: state => resourceId => state.resources.find(r => r.id === resourceId),
      getResourceNameById: state => resourceId => {
        const resource = state.resources.find(r => r.id === resourceId);
        return resource ? resource.name : 'Неизвестный ресурс';
      },
      managedResources: (state, getters, rootState) => {
        if (!rootState.auth.currentUser || rootState.auth.currentUser.role !== 'manager') return [];
        return state.resources.filter(r => r.managerId === rootState.auth.currentUser.id);
      }
    },
};