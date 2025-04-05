<template>
  <div class="booking-container">
    <div class="booking-card">
      <h1 class="booking-title">Бронирование</h1>

      <div v-if="step === 1" class="step">
        <h2>Шаг 1: Выберите тип ресурса</h2>
        <div class="resource-types">
          <button
            v-for="type in resourceTypes"
            :key="type.value"
            @click="selectResourceType(type.value)"
            :class="{ active: selectedResourceType === type.value }"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <div v-if="step === 2" class="step">
        <h2>Шаг 2: Выберите ресурс</h2>
        <div class="resource-list">
          <button
            v-for="resource in filteredResources"
            :key="resource.id"
            @click="selectResource(resource)"
            :class="{ active: selectedResource?.id === resource.id }"
          >
            {{ resource.name }}
            <span class="working-hours" v-if="resource.workingHours">
              ({{ resource.workingHours.start }} - {{ resource.workingHours.end }})
            </span>
          </button>
        </div>
        <button @click="step = 1" class="btn-back">Назад</button>
      </div>

      <div v-if="step === 3" class="step">
        <h2>Шаг 3: Выберите дату, время и продолжительность</h2>
        <CustomCalendar
          @date-selected="onDateSelected"
          @time-selected="onTimeSelected"
          :disabledDates="disabledDates"
          :minDate="minSelectableDate"
          :maxDate="maxSelectableDate"
          :disabledTimeSlots="disabledTimeSlots"
        />
        <div class="duration-select">
          <label for="duration">Продолжительность (часы):</label>
          <select id="duration" v-model="selectedDuration">
            <option 
              v-for="hour in availableDurations" 
              :key="hour" 
              :value="hour"
              :disabled="isDurationDisabled(hour)"
            >
              {{ hour }} {{ hour === 1 ? 'час' : hour < 5 ? 'часа' : 'часов' }}
            </option>
          </select>
          <div v-if="durationError" class="error-message">{{ durationError }}</div>
        </div>
        <button @click="step = 2" class="btn-back">Назад</button>
        <button @click="validateStep3" class="btn-next">Далее</button>
      </div>

      <div v-if="step === 4" class="step">
        <h2>Шаг 4: Подтверждение</h2>
        <div class="confirmation-details">
          <p><strong>Ресурс:</strong> {{ selectedResource.name }}</p>
          <p><strong>Дата:</strong> {{ selectedDate }}</p>
          <p><strong>Время:</strong> {{ selectedTime }}</p>
          <p><strong>Продолжительность:</strong> {{ selectedDuration }} {{ selectedDuration === 1 ? 'час' : selectedDuration < 5 ? 'часа' : 'часов' }}</p>
          <p><strong>Окончание:</strong> {{ calculateEndTime() }}</p>
        </div>
        <button @click="confirmBooking" class="btn-confirm">Подтвердить</button>
        <button @click="step = 3" class="btn-back">Назад</button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger mt-4">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="alert alert-success mt-4">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import CustomCalendar from '@/components/CustomCalendar.vue';

export default {
  components: {
    CustomCalendar,
  },
  setup() {
    const store = useStore();
    const toast = useToast();

    const step = ref(1);
    const selectedResourceType = ref('');
    const selectedResource = ref(null);
    const selectedDate = ref('');
    const selectedTime = ref('09:00');
    const selectedDuration = ref(1);
    const errorMessage = ref('');
    const successMessage = ref('');
    const durationError = ref('');

    const defaultWorkingHours = { start: '07:00', end: '19:00' };
    
    const minSelectableDate = new Date().toISOString().split('T')[0];
    const maxSelectableDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const resourceTypes = [
      { value: 'photographer', label: 'Фотограф' },
      { value: 'conference_room', label: 'Конференц-зал' },
      { value: 'equipment', label: 'Оборудование' },
    ];

    const filteredResources = computed(() => {
      if (!selectedResourceType.value) return [];
      return store.state.resources.filter(
        (resource) => resource.type === selectedResourceType.value
      ).map(resource => ({
        ...resource,
        workingHours: resource.workingHours || defaultWorkingHours
      }));
    });

    const disabledDates = computed(() => {
      if (!selectedResource.value) return [];
      const bookings = store.state.bookings.filter(
        (booking) => booking.resourceId === selectedResource.value.id
      );
      return bookings.map((booking) => booking.date);
    });

    const disabledTimeSlots = computed(() => {
      if (!selectedResource.value || !selectedDate.value) return [];
      
      const currentDate = new Date().toISOString().split('T')[0];
      const isToday = selectedDate.value === currentDate;
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const workingHours = selectedResource.value.workingHours || defaultWorkingHours;
      const [startHour, startMinute] = workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = workingHours.end.split(':').map(Number);
      
      const disabledSlots = [];
      
      if (isToday) {
        for (let hour = startHour; hour <= endHour; hour++) {
          if (hour < currentHour || (hour === currentHour && currentMinute > 0)) {
            disabledSlots.push(`${String(hour).padStart(2, '0')}:00`);
          }
        }
      }
      
      for (let hour = 0; hour < 24; hour++) {
        if (hour < startHour || hour >= endHour) {
          disabledSlots.push(`${String(hour).padStart(2, '0')}:00`);
        }
      }
      
      return disabledSlots;
    });

    const availableDurations = computed(() => {
      if (!selectedTime.value || !selectedResource.value) return Array.from({ length: 8 }, (_, i) => i + 1);
      
      const workingHours = selectedResource.value.workingHours || defaultWorkingHours;
      const [startHour, startMinute] = workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = workingHours.end.split(':').map(Number);
      const [selectedHour] = selectedTime.value.split(':').map(Number);
      
      const maxPossibleDuration = endHour - selectedHour;
      return Array.from({ length: Math.min(8, maxPossibleDuration) }, (_, i) => i + 1);
    });

    const isDurationDisabled = (duration) => {
      if (!selectedTime.value || !selectedResource.value) return false;
      
      const workingHours = selectedResource.value.workingHours || defaultWorkingHours;
      const [selectedHour] = selectedTime.value.split(':').map(Number);
      const [endHour] = workingHours.end.split(':').map(Number);
      
      return selectedHour + duration > endHour;
    };

    const selectResourceType = (type) => {
      selectedResourceType.value = type;
      step.value = 2;
    };

    const selectResource = (resource) => {
      selectedResource.value = resource;
      step.value = 3;
    };

    const onDateSelected = (date) => {
      selectedDate.value = date;
      selectedTime.value = '09:00';
      validateDuration();
    };

    const onTimeSelected = (time) => {
      selectedTime.value = time;
      validateDuration();
    };

    const validateDuration = () => {
      if (isDurationDisabled(selectedDuration.value)) {
        selectedDuration.value = 1;
        durationError.value = 'Выбранная продолжительность выходит за рабочие часы';
      } else {
        durationError.value = '';
      }
    };

    const validateStep3 = () => {
      if (!selectedDate.value) {
        errorMessage.value = 'Пожалуйста, выберите дату';
        return;
      }
      
      if (!selectedTime.value) {
        errorMessage.value = 'Пожалуйста, выберите время';
        return;
      }
      
      if (isDurationDisabled(selectedDuration.value)) {
        errorMessage.value = 'Недопустимая продолжительность бронирования';
        return;
      }
      
      errorMessage.value = '';
      step.value = 4;
    };

    const calculateEndTime = () => {
      if (!selectedTime.value || !selectedDuration.value) return '';
      
      const [hours, minutes] = selectedTime.value.split(':').map(Number);
      const endHours = hours + selectedDuration.value;
      return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const confirmBooking = async () => {
      const newBooking = {
        id: Date.now(),
        resourceId: selectedResource.value.id,
        date: selectedDate.value,
        time: selectedTime.value,
        duration: selectedDuration.value,
        userId: store.state.currentUser.id,
        isConfirmed: false,
      };

      try {
        await store.dispatch('addBooking', newBooking);
        successMessage.value = 'Бронирование успешно!';
        toast.success('Бронирование успешно!');
        resetForm();
      } catch (error) {
        errorMessage.value = error.message;
        toast.error(error.message);
      }
    };

    const resetForm = () => {
      step.value = 1;
      selectedResourceType.value = '';
      selectedResource.value = null;
      selectedDate.value = '';
      selectedTime.value = '09:00';
      selectedDuration.value = 1;
      errorMessage.value = '';
      successMessage.value = '';
    };

    watch(selectedDuration, validateDuration);

    return {
      step,
      resourceTypes,
      selectedResourceType,
      selectedResource,
      selectedDate,
      selectedTime,
      selectedDuration,
      availableDurations,
      filteredResources,
      disabledDates,
      disabledTimeSlots,
      minSelectableDate,
      maxSelectableDate,
      errorMessage,
      successMessage,
      durationError,
      selectResourceType,
      selectResource,
      onDateSelected,
      onTimeSelected,
      validateStep3,
      confirmBooking,
      calculateEndTime,
      isDurationDisabled,
    };
  },
};
</script>

<style lang="scss" scoped>
.booking-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.booking-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

.booking-title {
  font-size: 2rem;
  font-weight: 700;
  color: #343a40;
  text-align: center;
  margin-bottom: 1.5rem;
}

.step {
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 1.5rem;
  }
}

.resource-types,
.resource-list {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.resource-types button,
.resource-list button {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f8f9fa;
  font-size: 1rem;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  &.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
    box-shadow: 0 2px 5px rgba(0, 123, 255, 0.3);
  }
}

.btn-back,
.btn-next,
.btn-confirm {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-back {
  background-color: #6c757d;
  color: white;
  margin-right: 1rem;

  &:hover {
    background-color: #5a6268;
  }
}

.btn-next {
  background-color: #28a745;
  color: white;

  &:hover {
    background-color: #218838;
  }
}

.btn-confirm {
  background-color: #007bff;
  color: white;
  margin-right: 1rem;

  &:hover {
    background-color: #0069d9;
  }
}

.duration-select {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;

  label {
    font-size: 1rem;
    color: #495057;
    margin-right: 0.5rem;
    font-weight: 500;
  }

  select {
    padding: 0.5rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    background-color: #f8f9fa;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
  }
}

.confirmation-details {
  margin-bottom: 1.5rem;
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;

  p {
    font-size: 1rem;
    color: #495057;
    margin-bottom: 0.75rem;
    line-height: 1.6;

    strong {
      font-weight: 600;
      color: #343a40;
    }
  }
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  text-align: center;
  font-weight: 500;

  &-danger {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  &-success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
}

.working-hours {
  font-size: 0.8em;
  color: #6c757d;
  margin-left: 0.5em;
}

.error-message {
  color: #dc3545;
  font-size: 0.8em;
  margin-top: 0.5em;
}

@media (max-width: 576px) {
  .booking-card {
    padding: 1.5rem;
  }

  .btn-back,
  .btn-next,
  .btn-confirm {
    width: 100%;
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
}
</style>