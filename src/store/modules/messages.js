export default {
  namespaced: true,
  state: {
    messages: JSON.parse(localStorage.getItem('messages')) || [],
    groupMessages: JSON.parse(localStorage.getItem('groupMessages')) || [],
  },
  mutations: {
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
  },
  actions: {
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
    markMessagesAsRead({ commit, rootState }, userId) {
      if (rootState.auth.currentUser) {
        commit('MARK_MESSAGES_AS_READ', {
          userId,
          currentUserId: rootState.auth.currentUser.id,
        });
      }
    },
  },
  getters: {
    getMessagesForUser: (state, getters, rootState) => userId => {
      const currentUserId = rootState.auth.currentUser?.id;
      if (!currentUserId) return [];
      return state.messages
        .filter(
          m =>
            (m.senderId === currentUserId && m.receiverId === userId) ||
            (m.senderId === userId && m.receiverId === currentUserId)
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },
    getLastMessageForUser: (state, getters) => userId => {
      const messages = getters.getMessagesForUser(userId);
      return messages.length > 0 ? messages[messages.length - 1] : null;
    },
    getUnreadCountForUser: (state, getters, rootState) => userId => {
      const messages = getters.getMessagesForUser(userId);
      return messages.filter(m => m.receiverId === rootState.auth.currentUser?.id && !m.isRead).length;
    },
    getGroupMessages: state => {
      return state.groupMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },
    getTotalUnreadCount: (state, getters, rootState) => {
      const currentUserId = rootState.auth?.currentUser?.id;
      if (!currentUserId) return 0;
      return state.messages.filter(m => m.receiverId === currentUserId && !m.isRead).length;
    },
  },
};