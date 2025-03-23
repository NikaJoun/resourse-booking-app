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
        />
        <div class="duration-select">
          <label for="duration">Продолжительность (часы):</label>
          <select id="duration" v-model="selectedDuration">
            <option v-for="hour in availableDurations" :key="hour" :value="hour">
              {{ hour }}
            </option>
          </select>
        </div>
        <button @click="step = 2" class="btn-back">Назад</button>
        <button @click="step = 4" class="btn-next">Далее</button>
      </div>

      <div v-if="step === 4" class="step">
        <h2>Шаг 4: Подтверждение</h2>
        <div class="confirmation-details">
          <p><strong>Ресурс:</strong> {{ selectedResource.name }}</p>
          <p><strong>Дата:</strong> {{ selectedDate }}</p>
          <p><strong>Время:</strong> {{ selectedTime }}</p>
          <p><strong>Продолжительность:</strong> {{ selectedDuration }} час(ов)</p>
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
import { ref, computed } from 'vue';
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

    const resourceTypes = [
      { value: 'photographer', label: 'Фотограф' },
      { value: 'conference_room', label: 'Конференц-зал' },
      { value: 'equipment', label: 'Оборудование' },
    ];

    const availableDurations = Array.from({ length: 8 }, (_, i) => i + 1);

    const filteredResources = computed(() => {
      if (!selectedResourceType.value) return [];
      return store.state.resources.filter(
        (resource) => resource.type === selectedResourceType.value
      );
    });

    const disabledDates = computed(() => {
      if (!selectedResource.value) return [];
      const bookings = store.state.bookings.filter(
        (booking) => booking.resourceId === selectedResource.value.id
      );
      return bookings.map((booking) => booking.date);
    });

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
    };

    const onTimeSelected = (time) => {
      selectedTime.value = time;
    };

    const confirmBooking = async () => {
      const newBooking = {
        id: Date.now(),
        resourceId: selectedResource.value.id,
        date: selectedDate.value,
        time: selectedTime.value,
        duration: selectedDuration.value,
        userId: store.state.currentUser.id,
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
    };

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
      errorMessage,
      successMessage,
      selectResourceType,
      selectResource,
      onDateSelected,
      onTimeSelected,
      confirmBooking,
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
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #e9ecef;
    transform: scale(1.02);
  }

  &.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
}

.btn-back,
.btn-next {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: #6c757d;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5a6268;
  }
}

.btn-next {
  background-color: #28a745;
  margin-left: 1rem;

  &:hover {
    background-color: #218838;
  }
}

.duration-select {
  margin-top: 1.5rem;

  label {
    font-size: 1rem;
    color: #495057;
    margin-right: 0.5rem;
  }

  select {
    padding: 0.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
  }
}

.confirmation-details {
  margin-bottom: 1.5rem;

  p {
    font-size: 1rem;
    color: #495057;
    margin-bottom: 0.5rem;
  }
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  text-align: center;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  text-align: center;
}
</style>