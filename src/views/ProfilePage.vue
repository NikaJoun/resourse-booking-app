<template>
  <div class="profile-page">
    <ProfileHeader 
      :user="currentUser" 
      @sync="showSyncModal = true" 
      :formatRole="formatRole"
    />
    
    <div class="profile-tabs">
      <TabButtons v-model:activeTab="activeTab" />
      
      <div class="tabs-content">
        <ActiveBookingsTab 
          v-if="activeTab === 'active'" 
          :bookings="activeBookings"
          @cancel="openCancelModal"
          @export="exportSingleBooking"
        />
        
        <HistoryBookingsTab 
          v-else-if="activeTab === 'history'" 
          :bookings="bookingHistory"
        />
      </div>
    </div>
    
    <CancelBookingModal 
      v-if="showCancelModal"
      @close="closeCancelModal"
      @confirm="confirmCancel"
    />
    
    <CalendarExportModal 
      v-if="showSyncModal"
      @close="showSyncModal = false"
      @download="downloadICS"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import ProfileHeader from '@/components/profile/ProfileHeader.vue';
import TabButtons from '@/components/profile/TabButtons.vue';
import ActiveBookingsTab from '@/components/profile/ActiveBookingsTab.vue';
import HistoryBookingsTab from '@/components/profile/HistoryBookingsTab.vue';
import CancelBookingModal from '@/components/modals/CancelBookingModal.vue';
import CalendarExportModal from '@/components/modals/CalendarExportModal.vue';
import { generateICS, downloadICSFile } from '@/utils/calendarExport';

export default {
  components: {
    ProfileHeader,
    TabButtons,
    ActiveBookingsTab,
    HistoryBookingsTab,
    CancelBookingModal,
    CalendarExportModal
  },
  setup() {
    const store = useStore();
    const activeTab = ref('active');
    const showCancelModal = ref(false);
    const showSyncModal = ref(false);
    const selectedBookingId = ref(null);

    const currentUser = computed(() => store.state.auth.currentUser);
    const activeBookings = computed(() => store.getters['bookings/userActiveBookings']);
    const bookingHistory = computed(() => store.getters['bookings/userBookingHistory']);

    const formatRole = (role) => {
      const roles = {
        admin: 'Администратор',
        manager: 'Менеджер',
        user: 'Пользователь'
      };
      return roles[role] || role;
    };

    const openCancelModal = (bookingId) => {
      selectedBookingId.value = bookingId;
      showCancelModal.value = true;
    };

    const closeCancelModal = () => {
      showCancelModal.value = false;
      selectedBookingId.value = null;
    };

    const confirmCancel = () => {
      if (selectedBookingId.value) {
        store.dispatch('bookings/cancelBooking', selectedBookingId.value);
      }
      closeCancelModal();
    };

    const downloadICS = () => {
      const bookings = activeTab.value === 'active' ? activeBookings.value : bookingHistory.value;
      const icsContent = generateICS(bookings, store);
      downloadICSFile(icsContent, 'all-bookings.ics');
      
      store.dispatch('settings/UPDATE_LAST_EXPORT');
      store.dispatch('notifications/ADD_NOTIFICATION', {
        userId: currentUser.value.id,
        text: 'Бронирования экспортированы в файл календаря',
        type: 'calendar-export'
      }, { root: true });
    };

    const exportSingleBooking = (booking) => {
      const icsContent = generateICS([booking], store);
      downloadICSFile(icsContent, `booking-${booking.id}.ics`);
      
      store.dispatch('notifications/ADD_NOTIFICATION', {
        userId: currentUser.value.id,
        text: `Бронирование ${store.getters['resources/getResourceNameById'](booking.resourceId)} экспортировано`,
        type: 'calendar-export'
      }, { root: true });
    };

    return {
      activeTab,
      showCancelModal,
      showSyncModal,
      currentUser,
      activeBookings,
      bookingHistory,
      formatRole,
      openCancelModal,
      closeCancelModal,
      confirmCancel,
      downloadICS,
      exportSingleBooking
    };
  },
};
</script>

<style lang="scss" scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.profile-tabs {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs-content {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 576px) {
  .tabs-content {
    padding: 1rem;
  }
}
</style>