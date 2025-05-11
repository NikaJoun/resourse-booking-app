<template>
  <div class="admin-page">
    <ManagerHeader />
    
    <div class="admin-content">
      <ManagerTabs
        :active-tab="activeTab"
        @tab-change="handleTabChange"
      >
        <template #resources>
          <div v-if="managedResources.length === 0">
            <EmptyState
              icon="collection"
              message="У вас нет управляемых ресурсов"
            />
          </div>
          
          <div v-else class="admin-cards">
            <ResourceCard
              v-for="resource in managedResources"
              :key="resource.id"
              :resource="resource"
            />
          </div>
        </template>
        
        <template #bookings>
          <div v-if="pendingBookings.length === 0">
            <EmptyState
              icon="check-circle"
              message="Нет новых бронирований для подтверждения"
            />
          </div>
          
          <div v-else class="admin-cards">
            <BookingCard
              v-for="booking in pendingBookings"
              :key="booking.id"
              :booking="booking"
              :show-actions="true"
              @confirm="confirmBooking"
              @reject="rejectBooking"
            />
          </div>
        </template>
        
        <template #allBookings>
          <BookingFilters
            v-model:resource="selectedResourceFilter"
            v-model:date-from="dateFrom"
            v-model:date-to="dateTo"
            v-model:status="selectedStatusFilter"
            :resources="managedResources"
          />
          
          <div v-if="filteredAllBookings.length === 0">
            <EmptyState
              icon="calendar-x"
              message="Бронирования не найдены"
            />
          </div>
          
          <div v-else class="admin-cards">
            <BookingCard
              v-for="booking in filteredAllBookings"
              :key="booking.id"
              :booking="booking"
            />
          </div>
        </template>
      </ManagerTabs>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import { getResourceName, getUserName } from '@/utils/resourceUtils';
import { filterBookings, getStatusTextClass } from '@/utils/bookingUtils';
import ManagerHeader from '@/components/manager/ManagerHeader.vue';
import ManagerTabs from '@/components/manager/ManagerTabs.vue';
import ResourceCard from '@/components/manager/ResourceCard.vue';
import BookingCard from '@/components/manager/BookingCard.vue';
import BookingFilters from '@/components/manager/BookingFilters.vue';
import EmptyState from '@/components/manager/EmptyState.vue';

export default {
  components: {
    ManagerHeader,
    ManagerTabs,
    ResourceCard,
    BookingCard,
    BookingFilters,
    EmptyState
  },
  
  setup() {
    const store = useStore();
    const toast = useToast();
    const activeTab = ref('resources');
    const selectedResourceFilter = ref('');
    const dateFrom = ref('');
    const dateTo = ref('');
    const selectedStatusFilter = ref('');

    const managedResources = computed(() => {
      if (!store.getters['auth/isResourceManager']) return [];
      return store.state.resources.resources.filter(
        r => r.managerId === store.getters['auth/currentUser'].id
      );
    });

    const pendingBookings = computed(() => {
      if (!store.getters['auth/isResourceManager']) return [];
      return store.getters['bookings/pendingBookings'];
    });
    
    const allBookings = computed(() => {
      const resources = managedResources.value || [];
      const managedResourceIds = resources.map(resource => resource.id);
      const bookings = store.state.bookings?.bookings || [];
      return bookings.filter(booking =>
        managedResourceIds.includes(booking.resourceId)
      );
    });
    
    const filteredAllBookings = computed(() => {
      return filterBookings(
        allBookings.value,
        selectedResourceFilter.value,
        dateFrom.value,
        dateTo.value,
        selectedStatusFilter.value,
        store
      );
    });

    const handleTabChange = (tab) => {
      activeTab.value = tab;
    };

    const confirmBooking = async (bookingId) => {
      try {
        await store.dispatch('bookings/confirmBooking', bookingId);
        toast.success('Бронирование подтверждено');
      } catch (error) {
        toast.error('Ошибка при подтверждении бронирования');
        console.error(error);
      }
    };

    const rejectBooking = async (bookingId) => {
      try {
        await store.dispatch('bookings/cancelBooking', bookingId);
        toast.success('Бронирование отклонено');
      } catch (error) {
        toast.error('Ошибка при отклонении бронирования');
        console.error(error);
      }
    };

    return {
      activeTab,
      managedResources,
      pendingBookings,
      filteredAllBookings,
      selectedResourceFilter,
      dateFrom,
      dateTo,
      selectedStatusFilter,
      getResourceName,
      getUserName,
      getStatusTextClass,
      handleTabChange,
      confirmBooking,
      rejectBooking,
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

.admin-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 992px) {
  .admin-cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .admin-page {
    padding: 1.5rem 1rem;
  }
  
  .admin-cards {
    grid-template-columns: 1fr;
  }
}
</style>