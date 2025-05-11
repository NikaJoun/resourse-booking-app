<template>
  <div class="admin-page">
    <AdminHeader :isAdmin="isAdmin" />
    
    <div v-if="isAdmin" class="admin-content">
      <AdminTabs
        :activeTab="activeTab"
        @update:activeTab="activeTab = $event"
      >
        <template #users>
          <UsersTab
            :users="filteredUsers"
            :userSearchQuery="userSearchQuery"
            :userRoleFilter="userRoleFilter"
            @update:userSearchQuery="userSearchQuery = $event"
            @update:userRoleFilter="userRoleFilter = $event"
            @openUserModal="openUserModal"
            @confirmDeleteUser="confirmDeleteUser"
          />
        </template>
        
        <template #resources>
          <ResourcesTab
            :resources="filteredResources"
            :managers="managers"
            :resourceSearchQuery="resourceSearchQuery"
            :resourceTypeFilter="resourceTypeFilter"
            :resourceManagerFilter="resourceManagerFilter"
            @update:resourceSearchQuery="resourceSearchQuery = $event"
            @update:resourceTypeFilter="resourceTypeFilter = $event"
            @update:resourceManagerFilter="resourceManagerFilter = $event"
            @openResourceModal="openResourceModal"
            @confirmDeleteResource="confirmDeleteResource"
          />
        </template>
      </AdminTabs>
    </div>

    <UserModal
      ref="userModal"
      :user="currentUser"
      :isEditing="isEditingUser"
      @saved="handleUserSaved"
    />
    
    <ResourceModal
      ref="resourceModal"
      :resource="currentResource"
      :isEditing="isEditingResource"
      @saved="handleResourceSaved"
    />

    <ConfirmModal
      v-if="showConfirmModal"
      :message="confirmMessage"
      @confirm="executeConfirmAction"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import AdminHeader from '@/components/admin/AdminHeader.vue';
import AdminTabs from '@/components/admin/AdminTabs.vue';
import UsersTab from '@/components/admin/UsersTab.vue';
import ResourcesTab from '@/components/admin/ResourcesTab.vue';
import UserModal from '@/components/admin/UserModal.vue';
import ResourceModal from '@/components/admin/ResourceModal.vue';
import ConfirmModal from '@/components/admin/ConfirmModal.vue';
import { useUserFilters, useResourceFilters } from '@/utils/adminUtils';

export default {
  components: {
    AdminHeader,
    AdminTabs,
    UsersTab,
    ResourcesTab,
    UserModal,
    ResourceModal,
    ConfirmModal
  },
  setup() {
    const store = useStore();
    const userModal = ref(null);
    const resourceModal = ref(null);

    const activeTab = ref('users');
    const isEditingUser = ref(false);
    const isEditingResource = ref(false);
    const showConfirmModal = ref(false);
    const confirmMessage = ref('');
    const actionToConfirm = ref(null);
    const actionParams = ref(null);
    
    const currentUser = ref({
      id: null,
      username: '',
      password: '',
      role: 'user',
      managedResourceType: null,
    });

    const currentResource = ref({
      id: null,
      name: '',
      type: 'photographer',
      managerId: null,
    });

    const userSearchQuery = ref('');
    const userRoleFilter = ref('');
    const resourceSearchQuery = ref('');
    const resourceTypeFilter = ref('');
    const resourceManagerFilter = ref('');

    const users = computed(() => store.state.users.users);
    const resources = computed(() => store.state.resources.resources);
    const isAdmin = computed(() => store.getters['auth/isAdmin']);
    const managers = computed(() => 
      store.getters['users/getOtherUsers'].filter(user => user.role === 'manager')
    );

    const filteredUsers = useUserFilters(users, userSearchQuery, userRoleFilter);
    const filteredResources = useResourceFilters(
      resources, 
      resourceSearchQuery, 
      resourceTypeFilter, 
      resourceManagerFilter
    );

    const openUserModal = (user) => {
      currentUser.value = user 
        ? { ...user } 
        : {
            id: null,
            username: '',
            password: '',
            role: 'user',
            managedResourceType: null,
          };
      isEditingUser.value = !!user;
      userModal.value.show();
    };

    const openResourceModal = (resource) => {
      currentResource.value = resource
        ? { ...resource }
        : {
            id: null,
            name: '',
            type: 'photographer',
            managerId: null,
          };
      isEditingResource.value = !!resource;
      resourceModal.value.show();
    };

    const handleUserSaved = () => {};
    const handleResourceSaved = () => {};

    const confirmDeleteUser = (userId) => {
      const userName = users.value.find(u => u.id === userId)?.username || 'пользователя';
      confirmMessage.value = `Вы уверены, что хотите удалить ${userName}?`;
      actionToConfirm.value = (id) => store.dispatch('users/removeUser', id);
      actionParams.value = userId;
      showConfirmModal.value = true;
    };

    const confirmDeleteResource = (resourceId) => {
      const resourceName = resources.value.find(r => r.id === resourceId)?.name || 'ресурс';
      confirmMessage.value = `Вы уверены, что хотите удалить ${resourceName}?`;
      actionToConfirm.value = (id) => store.dispatch('resources/removeResource', id);
      actionParams.value = resourceId;
      showConfirmModal.value = true;
    };

    const executeConfirmAction = () => {
      if (actionToConfirm.value && actionParams.value) {
        actionToConfirm.value(actionParams.value);
      }
      showConfirmModal.value = false;
    };

    return {
      activeTab,
      isEditingUser,
      isEditingResource,
      showConfirmModal,
      confirmMessage,
      currentUser,
      currentResource,
      userSearchQuery,
      userRoleFilter,
      resourceSearchQuery,
      resourceTypeFilter,
      resourceManagerFilter,
      users,
      resources,
      isAdmin,
      managers,
      filteredUsers,
      filteredResources,
      userModal,
      resourceModal,
      openUserModal,
      openResourceModal,
      handleUserSaved,
      handleResourceSaved,
      confirmDeleteUser,
      confirmDeleteResource,
      executeConfirmAction
    };
  },
};
</script>

<style lang="scss" scoped>
.admin-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.admin-content {
  margin-top: 2rem;
}
</style>