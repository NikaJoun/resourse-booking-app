<template>
  <div class="messenger-modal" :class="{ 'is-open': isOpen }">
    <div class="modal-overlay" @click="close" />
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="bi bi-chat-text"></i> Мессенджер
        </h3>
        <button class="close-btn" @click="close">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i> {{ tab.label }}
            <span v-if="tab.id === 'personal' && totalUnreadCount > 0" class="badge">
              {{ totalUnreadCount }}
            </span>
          </button>
        </div>

        <div class="tab-content">
          <!-- Личные сообщения -->
          <div v-show="activeTab === 'personal'" class="personal-tab">
            <div class="user-list" :class="{ 'chat-open': !!selectedUser }">
              <div class="search-box">
                <i class="bi bi-search"></i>
                <input
                  v-model="searchQuery"
                  placeholder="Поиск пользователей..."
                  @input="handleSearch"
                />
              </div>
              <div
                v-for="user in filteredUsers"
                :key="user.id"
                class="user-item"
                :class="{ 
                  active: selectedUser?.id === user.id,
                  'has-unread': unreadCounts[user.id] > 0
                }"
                @click="selectUser(user)"
              >
                <div class="user-avatar">
                  <i class="bi bi-person-circle"></i>
                </div>
                <div class="user-info">
                  <span class="username">{{ user.username }}</span>
                  <span class="last-message">{{ getLastMessagePreview(user.id) }}</span>
                </div>
                <span v-if="unreadCounts[user.id] > 0" class="unread-count">
                  {{ unreadCounts[user.id] }}
                </span>
              </div>
            </div>

            <div v-if="selectedUser" class="chat-area" :class="{ active: !!selectedUser }">
              <div class="chat-header">
                <button class="back-btn" @click="selectedUser = null">
                  <i class="bi bi-arrow-left"></i>
                </button>
                <div class="chat-with">
                  Чат с <strong>{{ selectedUser.username }}</strong>
                </div>
              </div>
              <div ref="messagesContainer" class="messages">
                <div
                  v-for="message in currentMessages"
                  :key="message.id"
                  class="message"
                  :class="{
                    sent: message.senderId === currentUser.id,
                    received: message.senderId !== currentUser.id
                  }"
                >
                  <div class="message-content">
                    <div class="message-text">{{ message.text }}</div>
                    <div class="message-time">
                      {{ formatMessageTime(message.timestamp) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="message-input">
                <input
                  v-model="newMessage"
                  placeholder="Написать сообщение..."
                  @keyup.enter="sendMessage"
                />
                <button @click="sendMessage">
                  <i class="bi bi-send"></i>
                </button>
              </div>
            </div>
            <div v-else class="empty-chat">
              <i class="bi bi-chat-square-text"></i>
              <p>Выберите чат для общения</p>
            </div>
          </div>

          <!-- Общий чат -->
          <div v-show="activeTab === 'group'" class="group-tab">
            <div class="chat-header">
              <div class="chat-title">
                <i class="bi bi-people-fill"></i> Общий чат
              </div>
            </div>
            <div ref="groupMessagesContainer" class="messages">
              <div
                v-for="message in groupMessages"
                :key="message.id"
                class="message"
                :class="{
                  sent: message.senderId === currentUser.id,
                  received: message.senderId !== currentUser.id
                }"
              >
                <div class="message-content">
                  <div v-if="message.senderId !== currentUser.id" class="sender-name">
                    {{ getUserName(message.senderId) }}
                  </div>
                  <div class="message-text">{{ message.text }}</div>
                  <div class="message-time">
                    {{ formatMessageTime(message.timestamp) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="message-input">
              <input
                v-model="newGroupMessage"
                placeholder="Написать в общий чат..."
                @keyup.enter="sendGroupMessage"
              />
              <button @click="sendGroupMessage">
                <i class="bi bi-send"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const store = useStore()
    const activeTab = ref('personal')
    const searchQuery = ref('')
    const selectedUser = ref(null)
    const newMessage = ref('')
    const newGroupMessage = ref('')
    const messagesContainer = ref(null)
    const groupMessagesContainer = ref(null)

    const tabs = [
      { id: 'personal', label: 'Личные', icon: 'bi bi-person' },
      { id: 'group', label: 'Общий', icon: 'bi bi-people' }
    ]

    const currentUser = computed(() => store.state.auth.currentUser)
    const users = computed(() => store.state.users.users)
    const messages = computed(() => store.state.messages.messages)
    const groupMessages = computed(() => store.state.messages.groupMessages)

    const filteredUsers = computed(() => {
      return users.value
        .filter(user => user.id !== currentUser.value?.id)
        .filter(user => 
          user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    })

    const unreadCounts = computed(() => {
      const counts = {}
      if (!currentUser.value) return counts

      users.value.forEach(user => {
        if (user.id !== currentUser.value.id) {
          counts[user.id] = store.getters['messages/getUnreadCountForUser'](user.id)
        }
      })

      return counts
    })

    const totalUnreadCount = computed(() => {
      return Object.values(unreadCounts.value).reduce((sum, count) => sum + count, 0)
    })

    const currentMessages = computed(() => {
      if (!selectedUser.value || !currentUser.value) return []
      return store.getters['messages/getMessagesForUser'](selectedUser.value.id)
    })

    const getUserName = (userId) => {
      const user = users.value.find(u => u.id === userId)
      return user ? user.username : 'Неизвестный'
    }

    const getLastMessagePreview = (userId) => {
      const messages = store.getters['messages/getMessagesForUser'](userId)
      if (messages.length === 0) return 'Нет сообщений'
      
      const lastMessage = messages[messages.length - 1]
      return lastMessage.text.length > 30 
        ? lastMessage.text.substring(0, 30) + '...'
        : lastMessage.text
    }

    const formatMessageTime = (timestamp) => {
      try {
        return format(new Date(timestamp), 'HH:mm', { locale: ru })
      } catch {
        return timestamp
      }
    }

    const selectUser = (user) => {
      selectedUser.value = user
      store.dispatch('messages/markMessagesAsRead', user.id)
      nextTick(() => {
        scrollToBottom(messagesContainer.value)
      })
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim() || !selectedUser.value) return

      try {
        await store.dispatch('messages/sendMessage', {
          text: newMessage.value,
          senderId: currentUser.value.id,
          receiverId: selectedUser.value.id
        })
        newMessage.value = ''
        nextTick(() => {
          scrollToBottom(messagesContainer.value)
        })
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error)
      }
    }

    const sendGroupMessage = async () => {
      if (!newGroupMessage.value.trim()) return

      try {
        await store.dispatch('messages/sendGroupMessage', {
          text: newGroupMessage.value,
          senderId: currentUser.value.id
        })
        newGroupMessage.value = ''
        nextTick(() => {
          scrollToBottom(groupMessagesContainer.value)
        })
      } catch (error) {
        console.error('Ошибка при отправке группового сообщения:', error)
      }
    }

    const scrollToBottom = (container) => {
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }

    const close = () => {
      selectedUser.value = null
      emit('close')
    }

    watch(currentMessages, () => {
      nextTick(() => {
        scrollToBottom(messagesContainer.value)
      })
    }, { deep: true })

    watch(groupMessages, () => {
      nextTick(() => {
        scrollToBottom(groupMessagesContainer.value)
      })
    }, { deep: true })

    return {
      activeTab,
      tabs,
      searchQuery,
      selectedUser,
      newMessage,
      newGroupMessage,
      messagesContainer,
      groupMessagesContainer,
      currentUser,
      filteredUsers,
      unreadCounts,
      totalUnreadCount,
      currentMessages,
      groupMessages,
      getUserName,
      getLastMessagePreview,
      formatMessageTime,
      selectUser,
      sendMessage,
      sendGroupMessage,
      close
    }
  }
}
</script>

<style lang="scss" scoped>
.messenger-modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: auto;
  z-index: 1050;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;

  &.is-open {
    opacity: 1;
    visibility: visible;
    
    .modal-container {
      transform: translateX(0);
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  
  .is-open & {
    opacity: 1;
  }
}

.modal-container {
  width: 380px;
  max-width: 100%;
  height: 100vh;
  background-color: #ffffff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.modal-header {
  padding: 18px 20px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f9fafc;

  .modal-title {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 600;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 10px;

    i {
      color: #4a6bdf;
      font-size: 1.3rem;
    }
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #718096;
    cursor: pointer;
    transition: color 0.2s;
    padding: 4px;
    border-radius: 4px;

    &:hover {
      color: #4a6bdf;
      background-color: #f0f5ff;
    }
  }
}

.modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #ffffff;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #f0f2f5;
  background-color: #f9fafc;

  button {
    flex: 1;
    padding: 14px 16px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    font-size: 0.95rem;
    font-weight: 500;
    color: #718096;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    position: relative;

    &.active {
      color: #4a6bdf;
      border-bottom-color: #4a6bdf;
      background-color: rgba(74, 107, 223, 0.05);
    }

    .badge {
      position: absolute;
      top: 6px;
      right: 6px;
      background-color: #f44336;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    i {
      font-size: 1.1rem;
    }
  }
}

.tab-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.personal-tab {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  position: relative;
}

.user-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  background-color: #ffffff;
  transition: transform 0.3s ease;
}

.search-box {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f5;
  position: relative;
  background-color: #f9fafc;

  i {
    position: absolute;
    left: 28px;
    top: 50%;
    transform: translateY(-50%);
    color: #a8b1c7;
    font-size: 1rem;
  }

  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e1e5ee;
    border-radius: 8px;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s;
    background-color: #ffffff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:focus {
      border-color: #4a6bdf;
      box-shadow: 0 0 0 3px rgba(74, 107, 223, 0.2);
    }

    &::placeholder {
      color: #a8b1c7;
    }
  }
}

.user-item {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f8f9fa;
  position: relative;
  background-color: #ffffff;

  &:hover {
    background-color: #f8f9fa;
  }

  &.active {
    background-color: #f0f5ff;
  }

  &.has-unread {
    background-color: #f8fbff;
  }

  .user-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background-color: #e1e5ee;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7a7f9a;
    flex-shrink: 0;
    overflow: hidden;

    i {
      font-size: 1.4rem;
    }
  }

  .user-info {
    flex: 1;
    min-width: 0;

    .username {
      display: block;
      font-weight: 500;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #2d3748;
      font-size: 0.95rem;
    }

    .last-message {
      display: block;
      font-size: 0.85rem;
      color: #718096;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .unread-count {
    background-color: #4a6bdf;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 10;
  transform: translateX(100%);
  transition: transform 0.3s ease;

  &.active {
    transform: translateX(0);
  }
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f2f5;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  background-color: #f9fafc;

  .chat-with {
    font-weight: 500;
    color: #2d3748;
    flex: 1;
    
    strong {
      color: #4a6bdf;
    }
  }

  .back-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #718096;
    cursor: pointer;
    margin-right: 12px;
    padding: 4px;
    border-radius: 4px;
    
    &:hover {
      background-color: #f0f5ff;
      color: #4a6bdf;
    }
  }
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a8b1c7;
  padding: 20px;
  text-align: center;

  i {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.7;
  }

  p {
    font-size: 1.1rem;
    margin: 0;
    color: #718096;
    max-width: 80%;
    line-height: 1.5;
  }
}

.messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f9fafc;
  background-image: 
    linear-gradient(#f0f2f5 1px, transparent 1px),
    linear-gradient(90deg, #f0f2f5 1px, transparent 1px);
  background-size: 20px 20px;
}

.message {
  max-width: 80%;
  display: flex;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  &.sent {
    align-self: flex-end;

    .message-content {
      background-color: #4a6bdf;
      color: white;
      border-radius: 18px 18px 4px 18px;
      box-shadow: 0 2px 8px rgba(74, 107, 223, 0.3);
    }

    .message-time {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  &.received {
    align-self: flex-start;

    .message-content {
      background-color: #ffffff;
      color: #2d3748;
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid #f0f2f5;
    }
  }
}

.message-content {
  padding: 12px 16px;
  position: relative;
  max-width: 100%;

  .sender-name {
    font-size: 0.8rem;
    font-weight: 500;
    margin-bottom: 6px;
    color: #4a6bdf;
  }
}

.message-text {
  word-wrap: break-word;
  line-height: 1.5;
  font-size: 0.95rem;
}

.message-time {
  font-size: 0.75rem;
  margin-top: 6px;
  text-align: right;
  color: #a8b1c7;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  
  i {
    font-size: 0.9rem;
  }
}

.message-input {
  padding: 14px 16px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  gap: 10px;
  background-color: #ffffff;

  input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e1e5ee;
    border-radius: 12px;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s;
    background-color: #f9fafc;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:focus {
      border-color: #4a6bdf;
      box-shadow: 0 0 0 3px rgba(74, 107, 223, 0.2);
    }

    &::placeholder {
      color: #a8b1c7;
    }
  }

  button {
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 12px;
    background-color: #4a6bdf;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(74, 107, 223, 0.3);

    &:hover {
      background-color: #3a5bcf;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }

    i {
      font-size: 1.2rem;
    }
  }
}

.group-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2d3748;

  i {
    color: #4a6bdf;
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .modal-container {
    width: 100%;
    max-width: 380px;
  }

  .user-list.chat-open {
    transform: translateX(-100%);
  }
  
  .chat-area.active {
    transform: translateX(0);
  }
}

@media (max-width: 576px) {
  .modal-container {
    width: 100%;
    max-width: none;
  }
  
  .message {
    max-width: 90%;
  }
  
  .message-content {
    padding: 10px 14px;
  }
  
  .message-input {
    padding: 12px;
    
    input {
      padding: 10px 14px;
    }
    
    button {
      width: 44px;
      height: 44px;
    }
  }
}
</style>