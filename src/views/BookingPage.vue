<template>
    <div class="booking-container">
      <div class="booking-card">
        <h1 class="booking-title">Бронирование</h1>
  
        <!-- Выбор типа ресурса -->
        <div class="form-group mb-4">
          <label for="resourceType" class="form-label">Тип ресурса</label>
          <select
            class="form-control"
            id="resourceType"
            v-model="selectedResourceType"
          >
            <option value="">Выберите тип</option>
            <option value="photographer">Фотограф</option>
            <option value="conference_room">Конференц-зал</option>
            <option value="equipment">Оборудование</option>
          </select>
        </div>
  
        <!-- Выбор конкретного ресурса -->
        <div class="form-group mb-4" v-if="selectedResourceType">
          <label for="resource" class="form-label">Ресурс</label>
          <select
            class="form-control"
            id="resource"
            v-model="selectedResource"
          >
            <option value="">Выберите ресурс</option>
            <option
              v-for="resource in filteredResources"
              :key="resource.id"
              :value="resource.id"
            >
              {{ resource.name }}
            </option>
          </select>
        </div>
  
        <!-- Календарь -->
        <CustomCalendar
          v-if="selectedResource"
          @date-selected="onDateSelected"
          @time-selected="onTimeSelected"
        />
  
        <!-- Выбор продолжительности бронирования -->
        <div class="form-group mb-4" v-if="selectedDate">
          <label for="duration" class="form-label">Продолжительность (часы)</label>
          <select
            class="form-control"
            id="duration"
            v-model="selectedDuration"
          >
            <option value="1">1 час</option>
            <option value="2">2 часа</option>
            <option value="3">3 часа</option>
            <option value="4">4 часа</option>
          </select>
        </div>
  
        <!-- Кнопка бронирования -->
        <button
          class="btn btn-primary w-100"
          @click="bookResource"
          :disabled="!isFormValid"
        >
          Забронировать
        </button>
  
        <!-- Сообщение об ошибке -->
        <div v-if="errorMessage" class="alert alert-danger mt-4">
          {{ errorMessage }}
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
  
      // Данные формы
      const selectedResourceType = ref('');
      const selectedResource = ref('');
      const selectedDate = ref('');
      const selectedTime = ref('09:00');
      const selectedDuration = ref(1); // По умолчанию 1 час
      const errorMessage = ref('');
  
      // Фильтруем ресурсы по выбранному типу
      const filteredResources = computed(() => {
        if (!selectedResourceType.value) return [];
        return store.state.resources.filter(
          (resource) => resource.type === selectedResourceType.value
        );
      });
  
      // Проверяем, что форма заполнена
      const isFormValid = computed(() => {
        return (
          selectedResourceType.value &&
          selectedResource.value &&
          selectedDate.value &&
          selectedTime.value &&
          selectedDuration.value
        );
      });
  
      // Обработка выбора даты
      const onDateSelected = (date) => {
        selectedDate.value = date;
      };
  
      // Обработка выбора времени
      const onTimeSelected = (time) => {
        selectedTime.value = time;
      };
  
      // Логика бронирования
      const bookResource = async () => {
        const newBooking = {
          id: Date.now(),
          resourceId: selectedResource.value,
          date: selectedDate.value,
          time: selectedTime.value,
          duration: selectedDuration.value,
          userId: store.state.currentUser.id,
        };
  
        try {
          await store.dispatch('addBooking', newBooking);
          toast.success('Бронирование успешно!');
          resetForm();
        } catch (error) {
          errorMessage.value = error.message;
          toast.error(error.message); // Показываем уведомление об ошибке
        }
      };
  
      // Сброс формы
      const resetForm = () => {
        selectedResourceType.value = '';
        selectedResource.value = '';
        selectedDate.value = '';
        selectedTime.value = '09:00';
        selectedDuration.value = 1;
        errorMessage.value = '';
      };
  
      return {
        selectedResourceType,
        selectedResource,
        selectedDate,
        selectedTime,
        selectedDuration,
        filteredResources,
        isFormValid,
        errorMessage,
        onDateSelected,
        onTimeSelected,
        bookResource,
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
  
  .form-group {
    margin-bottom: 1.5rem;
  
    .form-label {
      font-size: 1rem;
      font-weight: 500;
      color: #495057;
      margin-bottom: 0.5rem;
    }
  
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 8px;
      font-size: 1rem;
      color: #495057;
      transition: border-color 0.3s ease;
  
      &:focus {
        border-color: #80bdff;
        outline: none;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }
    }
  }
  
  .btn-primary {
    background-color: #007bff;
    border: none;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 8px;
    transition: background-color 0.3s ease;
  
    &:hover {
      background-color: #0056b3;
    }
  
    &:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
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
  </style>