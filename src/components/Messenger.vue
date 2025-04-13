<template>
  <div class="messenger-wrapper" v-if="isOpen">
    <div class="messenger-container">
      <div class="header">
        <h3>Мессенджер</h3>
        <button @click="close" class="close-btn">×</button>
      </div>

      <div class="tabs">
        <button @click="activeTab = 'personal'" :class="{active: activeTab === 'personal'}">
          Личные
        </button>
        <button @click="activeTab = 'group'" :class="{active: activeTab === 'group'}">
          Общий чат
        </button>
      </div>

      <div v-if="activeTab === 'personal'" class="personal-chat">
        <div class="user-list">
          <div class="search-user">
            <input v-model="searchQuery" placeholder="Поиск пользователя..." />
          </div>
          <div 
            v-for="user in filteredUsers" 
            :key="user.id" 
            @click="selectUser(user)"
            class="user-item"
            :class="{active: selectedUser?.id === user.id}"
          >
            {{ user.username }}
            <span v-if="unreadCount(user.id)" class="unread-badge">{{ unreadCount(user.id) }}</span>
          </div>
        </div>

        <div class="chat-area" v-if="selectedUser">
          <div class="messages">
            <div 
              v-for="msg in filteredMessages" 
              :key="msg.id"
              class="message"
              :class="{sent: msg.senderId === currentUser.id}"
            >
              <div class="text">{{ msg.text }}</div>
              <div class="time">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>

          <div class="input-area">
            <input 
              v-model="personalMessage" 
              @keyup.enter="sendPersonalMessage"
              placeholder="Написать сообщение..."
            />
            <button @click="sendPersonalMessage">Отправить</button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'group'" class="group-chat">
        <div class="messages">
          <div 
            v-for="msg in groupMessages" 
            :key="msg.id"
            class="message"
            :class="{sent: msg.senderId === currentUser.id}"
          >
            <div class="sender" v-if="msg.senderId !== currentUser.id">
              {{ getUserName(msg.senderId) }}
            </div>
            <div class="text">{{ msg.text }}</div>
            <div class="time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <div class="input-area">
          <input 
            v-model="groupMessage" 
            @keyup.enter="sendGroupMessage"
            placeholder="Написать в общий чат..."
          />
          <button @click="sendGroupMessage">Отправить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue';
import { useStore } from 'vuex';

export default {
  props: {
    isOpen: Boolean
  },
  emits: ['close'],
  setup(props, { emit }) {
    const store = useStore();
    const activeTab = ref('personal');
    const selectedUser = ref(null);
    const personalMessage = ref('');
    const groupMessage = ref('');
    const searchQuery = ref('');

    const currentUser = computed(() => store.state.currentUser);
    const otherUsers = computed(() => {
      return store.state.users?.filter(u => u.id !== currentUser.value?.id) || [];
    });

    const filteredUsers = computed(() => {
      return otherUsers.value.filter(user =>
        user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const unreadCount = (userId) => {
      return store.state.messages?.filter(msg =>
        msg.senderId === userId &&
        msg.receiverId === currentUser.value.id &&
        !msg.isRead
      ).length;
    };

    const markMessagesAsRead = (userId) => {
      store.dispatch('markMessagesAsRead', userId);
    };

    const messages = computed(() => store.state.messages || []);
    const groupMessages = computed(() => store.state.groupMessages || []);

    const filteredMessages = computed(() => {
      if (!selectedUser.value || !currentUser.value) return [];
      return messages.value.filter(msg => 
        (msg.senderId === currentUser.value.id && msg.receiverId === selectedUser.value.id) ||
        (msg.senderId === selectedUser.value.id && msg.receiverId === currentUser.value.id)
      ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });

    const selectUser = (user) => {
      selectedUser.value = user;
      markMessagesAsRead(user.id);
      nextTick(() => scrollToBottom('personal'));
    };

    const sendPersonalMessage = async () => {
      if (!personalMessage.value.trim() || !selectedUser.value) return;

      await store.dispatch('sendMessage', {
        text: personalMessage.value,
        senderId: currentUser.value.id,
        receiverId: selectedUser.value.id,
        timestamp: new Date().toISOString()
      });

      personalMessage.value = '';
      nextTick(() => scrollToBottom('personal'));
    };

    const sendGroupMessage = async () => {
      if (!groupMessage.value.trim()) return;

      await store.dispatch('sendGroupMessage', {
        text: groupMessage.value,
        senderId: currentUser.value.id,
        timestamp: new Date().toISOString()
      });

      groupMessage.value = '';
      nextTick(() => scrollToBottom('group'));
    };

    const scrollToBottom = (type) => {
      const container = document.querySelector(
        type === 'personal' ? '.personal-chat .messages' : '.group-chat .messages'
      );
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    };

    const getUserName = (userId) => {
      const user = store.state.users?.find(u => u.id === userId);
      return user?.username || `User ${userId}`;
    };

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const close = () => emit('close');

    watch(messages, () => {
      if (activeTab.value === 'personal') scrollToBottom('personal');
    }, { deep: true });

    watch(groupMessages, () => {
      if (activeTab.value === 'group') scrollToBottom('group');
    }, { deep: true });

    return {
      activeTab,
      currentUser,
      otherUsers,
      filteredUsers,
      selectedUser,
      personalMessage,
      groupMessage,
      filteredMessages,
      groupMessages,
      selectUser,
      sendPersonalMessage,
      sendGroupMessage,
      getUserName,
      formatTime,
      close,
      searchQuery,
      unreadCount
    };
  }
};
</script>

<style scoped>
.messenger-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  height: 500px;
  z-index: 1000;
  font-family: 'Segoe UI', sans-serif;
}

.messenger-container {
  background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  background: #ffffff;
}

.header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #343a40;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #adb5bd;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #495057;
}

.tabs {
  display: flex;
  background: #f1f3f5;
}

.tabs button {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.3s;
}

.tabs button.active {
  background: #ffffff;
  border-bottom: 3px solid #0d6efd;
  color: #0d6efd;
}

.personal-chat {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.user-list {
  width: 140px;
  border-right: 1px solid #dee2e6;
  background: #f8f9fa;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.search-user {
  padding: 8px;
}

.search-user input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 10px;
  font-size: 0.9rem;
  outline: none;
}

.user-item {
  padding: 10px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.user-item:hover, .user-item.active {
  background: #e9ecef;
  font-weight: 500;
}

.unread-badge {
  background: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: bold;
}

.chat-area, .group-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.messages {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: #ffffff;
  min-height: 0;
}

.message {
  margin-bottom: 12px;
  max-width: 80%;
  transition: all 0.3s;
}

.message.sent {
  margin-left: auto;
  text-align: right;
}

.message .text {
  padding: 10px 14px;
  border-radius: 18px;
  display: inline-block;
  background: #e9ecef;
  color: #212529;
  word-break: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message.sent .text {
  background: #0d6efd;
  color: #fff;
}

.message .time {
  font-size: 0.75rem;
  color: #adb5bd;
  margin-top: 4px;
}

.message .sender {
  font-size: 0.8rem;
  color: #495057;
  margin-bottom: 2px;
}

.input-area {
  flex-shrink: 0;
  padding: 12px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  display: flex;
  width: 100%;
  box-sizing: border-box;
}

.input-area input {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border: 1px solid #ced4da;
  border-radius: 20px;
  margin-right: 10px;
  outline: none;
  transition: border-color 0.3s;
}

.input-area input:focus {
  border-color: #0d6efd;
}

.input-area button {
  padding: 8px 16px;
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
  min-width: 80px;
}

.input-area button:hover {
  background: #0b5ed7;
}
</style>