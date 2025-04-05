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
            <div 
              v-for="user in otherUsers" 
              :key="user.id" 
              @click="selectUser(user)"
              class="user-item"
              :class="{active: selectedUser?.id === user.id}"
            >
              {{ user.username }}
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

      const currentUser = computed(() => store.state.currentUser);
      const otherUsers = computed(() => {
        return store.state.users?.filter(u => u.id !== currentUser.value?.id) || [];
      });
  
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
        close
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
  }
  
  .messenger-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
  }
  
  .tabs {
    display: flex;
    border-bottom: 1px solid #eee;
  }
  
  .tabs button {
    flex: 1;
    padding: 10px;
    border: none;
    background: none;
    cursor: pointer;
  }
  
  .tabs button.active {
    border-bottom: 2px solid #007bff;
    color: #007bff;
  }
  
  .personal-chat {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .user-list {
    width: 120px;
    border-right: 1px solid #eee;
    overflow-y: auto;
  }
  
  .user-item {
    padding: 10px;
    cursor: pointer;
  }
  
  .user-item:hover, .user-item.active {
    background: #f5f5f5;
  }
  
  .chat-area, .group-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .messages {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
  }
  
  .message {
    margin-bottom: 10px;
    max-width: 80%;
  }
  
  .message.sent {
    margin-left: auto;
    text-align: right;
  }
  
  .message .text {
    padding: 8px 12px;
    border-radius: 15px;
    display: inline-block;
    background: #e9ecef;
    word-break: break-word;
  }
  
  .message.sent .text {
    background: #007bff;
    color: white;
  }
  
  .message .time {
    font-size: 0.7rem;
    color: #999;
    margin-top: 2px;
  }
  
  .message .sender {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 2px;
  }
  
  .input-area {
    padding: 10px;
    display: flex;
    border-top: 1px solid #eee;
  }
  
  .input-area input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    margin-right: 8px;
  }
  
  .input-area button {
    padding: 8px 15px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  </style>