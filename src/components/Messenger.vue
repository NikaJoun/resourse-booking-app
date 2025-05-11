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
            <div class="user-list">
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

            <div v-if="selectedUser" class="chat-area">
              <div class="chat-header">
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
                <div v-if="message.senderId !== currentUser.id" class="sender-name">
                  {{ getUserName(message.senderId) }}
                </div>
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
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;

  &.is-open {
    opacity: 1;
    visibility: visible;

    .modal-container {
      transform: translateY(0);
    }
  }
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {
  width: 90%;
  max-width: 900px;
  height: 80vh;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      color: #4a6bdf;
    }
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #7a7f9a;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #4a6bdf;
    }
  }
}

.modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #f0f2f5;

  button {
    flex: 1;
    padding: 12px 16px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    font-size: 0.95rem;
    font-weight: 500;
    color: #7a7f9a;
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
    }

    .badge {
      position: absolute;
      top: 4px;
      right: 8px;
      background-color: #f44336;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
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
}

.user-list {
  width: 280px;
  border-right: 1px solid #f0f2f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-box {
  padding: 12px;
  border-bottom: 1px solid #f0f2f5;
  position: relative;

  i {
    position: absolute;
    left: 24px;
    top: 50%;
    transform: translateY(-50%);
    color: #a8b1c7;
  }

  input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid #e1e5ee;
    border-radius: 8px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #4a6bdf;
    }
  }
}

.user-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f8f9fa;
  position: relative;

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
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #e1e5ee;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7a7f9a;

    i {
      font-size: 1.5rem;
    }
  }

  .user-info {
    flex: 1;
    min-width: 0;

    .username {
      display: block;
      font-weight: 500;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .last-message {
      display: block;
      font-size: 0.8rem;
      color: #7a7f9a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .unread-count {
    background-color: #4a6bdf;
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
  }
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
  font-size: 0.95rem;

  .chat-with {
    font-weight: 500;
  }
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a8b1c7;

  i {
    font-size: 3rem;
    margin-bottom: 16px;
  }

  p {
    font-size: 1.1rem;
    margin: 0;
  }
}

.messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 70%;
  display: flex;

  &.sent {
    align-self: flex-end;

    .message-content {
      background-color: #4a6bdf;
      color: white;
      border-radius: 12px 12px 0 12px;
    }

    .message-time {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  &.received {
    align-self: flex-start;

    .message-content {
      background-color: #f0f2f5;
      color: #333;
      border-radius: 12px 12px 12px 0;
    }
  }
}

.message-content {
  padding: 10px 14px;
  position: relative;
}

.message-text {
  word-wrap: break-word;
  line-height: 1.4;
}

.message-time {
  font-size: 0.7rem;
  margin-top: 4px;
  text-align: right;
  color: #7a7f9a;
}

.sender-name {
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 4px;
  color: #5a6378;
}

.message-input {
  padding: 12px 16px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #e1e5ee;
    border-radius: 8px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #4a6bdf;
    }
  }

  button {
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 8px;
    background-color: #4a6bdf;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #3a5bcf;
    }

    i {
      font-size: 1.1rem;
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
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    color: #4a6bdf;
  }
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    height: 90vh;
  }

  .user-list {
    width: 240px;
  }
}

@media (max-width: 576px) {
  .modal-container {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }

  .personal-tab {
    flex-direction: column;
  }

  .user-list {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #f0f2f5;
  }

  .chat-area {
    height: calc(100vh - 300px);
  }
}
</style>