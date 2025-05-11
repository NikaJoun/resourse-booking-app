<template>
  <div class="booking-page">
    <BookingHeader :step="step" />
    
    <main class="booking-content">
      <ResourceTypeStep 
        v-if="step === 1" 
        v-model:selectedResourceType="selectedResourceType"
      />
      
      <ResourceSelectionStep 
        v-if="step === 2" 
        :resourceType="selectedResourceType"
        v-model:selectedResource="selectedResource"
      />
      
      <DateTimeStep 
        v-if="step === 3" 
        :resource="selectedResource"
        v-model:date="selectedDate"
        v-model:time="selectedTime"
        v-model:duration="selectedDuration"
      />
      
      <ConfirmationStep 
        v-if="step === 4" 
        :resource="selectedResource"
        :date="selectedDate"
        :time="selectedTime"
        :duration="selectedDuration"
      />
      
      <AlertMessage 
        v-if="errorMessage" 
        type="error" 
        :message="errorMessage"
      />
      <AlertMessage 
        v-if="successMessage" 
        type="success" 
        :message="successMessage"
      />
    </main>
    
    <BookingFooter 
      :step="step"
      :canProceed="canProceed"
      :canConfirm="canConfirm"
      @prev="step--"
      @next="validateAndProceed"
      @confirm="confirmBooking"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import { getHourText, hasTimeConflict, formatSelectedDate, calculateEndTime } from '@/utils/booking';
import BookingHeader from '@/components/booking/BookingHeader.vue';
import ResourceTypeStep from '@/components/booking/ResourceTypeStep.vue';
import ResourceSelectionStep from '@/components/booking/ResourceSelectionStep.vue';
import DateTimeStep from '@/components/booking/DateTimeStep.vue';
import ConfirmationStep from '@/components/booking/ConfirmationStep.vue';
import BookingFooter from '@/components/booking/BookingFooter.vue';
import AlertMessage from '@/components/booking/AlertMessage.vue';

export default {
  components: {
    BookingHeader,
    ResourceTypeStep,
    ResourceSelectionStep,
    DateTimeStep,
    ConfirmationStep,
    BookingFooter,
    AlertMessage
  },
  
  setup() {
    const store = useStore();
    const toast = useToast();

    const step = ref(1);
    const selectedResourceType = ref('');
    const selectedResource = ref(null);
    const selectedDate = ref('');
    const selectedTime = ref('');
    const selectedDuration = ref(1);
    const errorMessage = ref('');
    const successMessage = ref('');

    const canProceed = computed(() => {
      switch (step.value) {
        case 1: return selectedResourceType.value !== '';
        case 2: return selectedResource.value !== null;
        case 3: return selectedDate.value && selectedTime.value;
        default: return true;
      }
    });

    const canConfirm = computed(() => {
      return selectedResource.value && selectedDate.value && selectedTime.value;
    });

    const validateAndProceed = () => {
      errorMessage.value = '';
      
      if (step.value === 3) {
        const testBooking = {
          resourceId: selectedResource.value.id,
          date: selectedDate.value,
          time: selectedTime.value,
          duration: selectedDuration.value
        };
        
        if (hasTimeConflict(testBooking, store.state.bookings.bookings)) {
          errorMessage.value = 'Выбранное время уже занято';
          return;
        }
      }
      
      step.value++;
    };

    const confirmBooking = async () => {
      const newBooking = {
        id: Date.now(),
        resourceId: selectedResource.value.id,
        date: selectedDate.value,
        time: selectedTime.value,
        duration: selectedDuration.value,
        userId: store.state.auth.currentUser.id,
        isConfirmed: false,
      };

      try {
        await store.dispatch('bookings/addBooking', newBooking);
        successMessage.value = 'Бронирование успешно создано!';
        toast.success('Бронирование успешно создано!');
        resetForm();
      } catch (error) {
        errorMessage.value = 'Ошибка при создании бронирования: ' + error.message;
        toast.error('Ошибка при создании бронирования');
      }
    };

    const resetForm = () => {
      step.value = 1;
      selectedResourceType.value = '';
      selectedResource.value = null;
      selectedDate.value = '';
      selectedTime.value = '';
      selectedDuration.value = 1;
      errorMessage.value = '';
      setTimeout(() => successMessage.value = '', 3000);
    };

    return {
      step,
      selectedResourceType,
      selectedResource,
      selectedDate,
      selectedTime,
      selectedDuration,
      errorMessage,
      successMessage,
      canProceed,
      canConfirm,
      validateAndProceed,
      confirmBooking,
      getHourText,
      formatSelectedDate,
      calculateEndTime
    };
  },
};
</script>

<style lang="scss" scoped>
/* Основные стили остаются такими же */
.booking-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Roboto', sans-serif;
}

.booking-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
}
</style>