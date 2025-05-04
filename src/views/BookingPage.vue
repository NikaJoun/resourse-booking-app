<template>
  <div class="booking-page">
    <header class="booking-header">
      <h1>Бронирование ресурсов</h1>
      <div class="booking-steps">
        <div :class="['step', { active: step === 1 }]">
          <span class="step-number">1</span>
          <span class="step-title">Тип ресурса</span>
        </div>
        <div :class="['step', { active: step === 2 }]">
          <span class="step-number">2</span>
          <span class="step-title">Выбор ресурса</span>
        </div>
        <div :class="['step', { active: step === 3 }]">
          <span class="step-number">3</span>
          <span class="step-title">Дата и время</span>
        </div>
        <div :class="['step', { active: step === 4 }]">
          <span class="step-number">4</span>
          <span class="step-title">Подтверждение</span>
        </div>
      </div>
    </header>

    <main class="booking-content">
      <div v-if="step === 1" class="step-content">
        <h2>Выберите тип ресурса</h2>
        <div class="resource-types">
          <button
            v-for="type in resourceTypes"
            :key="type.value"
            @click="selectResourceType(type.value)"
            :class="['resource-type-card', { active: selectedResourceType === type.value }]"
          >
            <div class="type-icon">
              <i :class="type.icon"></i>
            </div>
            <span class="type-name">{{ type.label }}</span>
          </button>
        </div>
      </div>

      <div v-if="step === 2" class="step-content">
        <h2>Выберите ресурс</h2>
        <div class="resource-list">
          <div
            v-for="resource in filteredResources"
            :key="resource.id"
            @click="selectResource(resource)"
            :class="['resource-card', { active: selectedResource?.id === resource.id }]"
          >
            <div class="resource-icon">
              <i :class="getResourceIcon(resource.type)"></i>
            </div>
            <div class="resource-info">
              <h3>{{ resource.name }}</h3>
              <p v-if="resource.description">{{ resource.description }}</p>
              <div class="working-hours">
                <i class="bi bi-clock"></i>
                {{ resource.workingHours.start }} - {{ resource.workingHours.end }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="step === 3" class="step-content">
        <h2>Выберите дату и время</h2>
        <div class="datetime-selection">
          <div class="calendar-section">
            <CustomCalendar
              v-if="selectedResource"
              @date-selected="onDateSelected"
              @time-selected="onTimeSelected"
              :resourceId="selectedResource.id"
              :workingHours="selectedResource.workingHours || defaultWorkingHours"
              :minDate="minSelectableDate"
              :maxDate="maxSelectableDate"
            />
          </div>
          <div class="duration-section">
            <h3>Продолжительность</h3>
            <div class="duration-options">
              <button
                v-for="hour in availableDurations"
                :key="hour"
                @click="selectedDuration = hour"
                :class="['duration-option', { active: selectedDuration === hour, disabled: isDurationDisabled(hour) }]"
                :disabled="isDurationDisabled(hour)"
              >
                {{ hour }} {{ getHourText(hour) }}
              </button>
            </div>
            <div class="selected-time-info">
              <div v-if="selectedDate && selectedTime" class="time-summary">
                <div class="time-block">
                  <span class="time-label">Начало:</span>
                  <span class="time-value">{{ selectedTime }}, {{ formatSelectedDate() }}</span>
                </div>
                <div class="time-block">
                  <span class="time-label">Окончание:</span>
                  <span class="time-value">{{ calculateEndTime() }}</span>
                </div>
              </div>
              <div v-else class="time-placeholder">
                Выберите дату и время
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="step === 4" class="step-content confirmation-step">
        <h2>Подтверждение бронирования</h2>
        <div class="confirmation-details">
          <div class="detail-card">
            <div class="detail-icon">
              <i class="bi bi-pc-display"></i>
            </div>
            <div class="detail-info">
              <h3>Ресурс</h3>
              <p>{{ selectedResource.name }}</p>
            </div>
          </div>
          
          <div class="detail-card">
            <div class="detail-icon">
              <i class="bi bi-calendar-date"></i>
            </div>
            <div class="detail-info">
              <h3>Дата</h3>
              <p>{{ formatSelectedDate() }}</p>
            </div>
          </div>
          
          <div class="detail-card">
            <div class="detail-icon">
              <i class="bi bi-clock"></i>
            </div>
            <div class="detail-info">
              <h3>Время</h3>
              <p>{{ selectedTime }} - {{ calculateEndTime() }}</p>
            </div>
          </div>
          
          <div class="detail-card">
            <div class="detail-icon">
              <i class="bi bi-hourglass"></i>
            </div>
            <div class="detail-info">
              <h3>Продолжительность</h3>
              <p>{{ selectedDuration }} {{ getHourText(selectedDuration) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="alert alert-error">
        <i class="bi bi-exclamation-circle"></i>
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="alert alert-success">
        <i class="bi bi-check-circle"></i>
        {{ successMessage }}
      </div>
    </main>

    <footer class="booking-footer">
      <button 
        v-if="step > 1" 
        @click="step--" 
        class="btn btn-secondary"
      >
        <i class="bi bi-chevron-left"></i> Назад
      </button>
      <div class="footer-spacer"></div>
      <button 
        v-if="step < 4" 
        @click="validateAndProceed" 
        class="btn btn-primary"
        :disabled="!canProceed"
      >
        Далее <i class="bi bi-chevron-right"></i>
      </button>
      <button 
        v-if="step === 4" 
        @click="confirmBooking" 
        class="btn btn-confirm"
        :disabled="!canConfirm"
      >
        <i class="bi bi-check-lg"></i> Подтвердить бронь
      </button>
    </footer>
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
    const selectedTime = ref('');
    const selectedDuration = ref(1);
    const errorMessage = ref('');
    const successMessage = ref('');

    const defaultWorkingHours = { start: '08:00', end: '19:00' };
    const minSelectableDate = new Date().toISOString().split('T')[0];
    const maxSelectableDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const resourceTypes = [
      { value: 'photographer', label: 'Фотограф', icon: 'bi bi-camera' },
      { value: 'conference_room', label: 'Конференц-зал', icon: 'bi bi-building' },
      { value: 'equipment', label: 'Оборудование', icon: 'bi bi-pc-display' },
    ];

    const getResourceIcon = (type) => {
      const typeObj = resourceTypes.find(t => t.value === type);
      return typeObj ? typeObj.icon : 'bi bi-pc-display';
    };

    const getHourText = (hours) => {
      if (hours === 1) return 'час';
      if (hours < 5) return 'часа';
      return 'часов';
    };

    const filteredResources = computed(() => {
      if (!selectedResourceType.value) return [];
      return store.state.resources.resources
        .filter(resource => resource.type === selectedResourceType.value)
        .map(resource => ({
          ...resource,
          workingHours: resource.workingHours || defaultWorkingHours
        }));
    });

    const disabledDates = computed(() => {
      if (!selectedResource.value) return [];
      return store.state.bookings.bookings
        .filter(booking => booking.resourceId === selectedResource.value.id)
        .map(booking => booking.date);
    });

    const disabledTimeSlots = computed(() => {
      if (!selectedResource.value || !selectedDate.value) return [];
      
      const currentDate = new Date().toISOString().split('T')[0];
      const isToday = selectedDate.value === currentDate;
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const workingHours = selectedResource.value.workingHours || defaultWorkingHours;
      const [startHour] = workingHours.start.split(':').map(Number);
      const [endHour] = workingHours.end.split(':').map(Number);
      
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
      if (!selectedTime.value || !selectedResource.value) return [1, 2, 3, 4];
      
      const workingHours = selectedResource.value.workingHours || defaultWorkingHours;
      const [selectedHour] = selectedTime.value.split(':').map(Number);
      const [endHour] = workingHours.end.split(':').map(Number);
      
      const maxPossibleDuration = endHour - selectedHour;
      return [1, 2, 3, 4].filter(d => d <= maxPossibleDuration);
    });

    const isDurationDisabled = (duration) => {
      if (!selectedTime.value || !selectedResource.value) return false;
      
      const workingHours = selectedResource.value.workingHours || defaultWorkingHours;
      const [selectedHour] = selectedTime.value.split(':').map(Number);
      const [endHour] = workingHours.end.split(':').map(Number);
      
      return selectedHour + duration > endHour;
    };

    const hasTimeConflict = (newBooking) => {
      const bookingsForResource = store.state.bookings.bookings.filter(
        booking => booking.resourceId === newBooking.resourceId && 
                  booking.date === newBooking.date &&
                  !booking.isCancelled
      );
      
      if (bookingsForResource.length === 0) return false;

      const newStart = convertTimeToMinutes(newBooking.time);
      const newEnd = newStart + newBooking.duration * 60;
      
      return bookingsForResource.some(existingBooking => {
        const existingStart = convertTimeToMinutes(existingBooking.time);
        const existingEnd = existingStart + existingBooking.duration * 60;
        
        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );
      });
    };

    const convertTimeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const canProceed = computed(() => {
      switch (step.value) {
        case 1: return selectedResourceType.value !== '';
        case 2: return selectedResource.value !== null;
        case 3: return selectedDate.value !== '' && selectedTime.value !== '' && !isDurationDisabled(selectedDuration.value);
        default: return true;
      }
    });

    const canConfirm = computed(() => {
      return selectedResource.value && selectedDate.value && selectedTime.value;
    });

    const selectResourceType = (type) => {
      selectedResourceType.value = type;
      selectedResource.value = null;
      step.value = 2;
    };

    const selectResource = (resource) => {
      selectedResource.value = resource;
      step.value = 3;
    };

    const onDateSelected = (date) => {
      selectedDate.value = date;
      selectedTime.value = '';
      validateDuration();
    };

    const onTimeSelected = (time) => {
      selectedTime.value = time;
      validateDuration();
    };

    const validateDuration = () => {
      if (isDurationDisabled(selectedDuration.value)) {
        selectedDuration.value = 1;
      }
    };

    const validateAndProceed = () => {
      errorMessage.value = '';
      
      if (step.value === 3) {
        if (!selectedDate.value) {
          errorMessage.value = 'Пожалуйста, выберите дату';
          return;
        }
        
        if (!selectedTime.value) {
          errorMessage.value = 'Пожалуйста, выберите время';
          return;
        }
        
        if (isDurationDisabled(selectedDuration.value)) {
          errorMessage.value = 'Выбранная продолжительность недоступна';
          return;
        }
        
        const testBooking = {
          resourceId: selectedResource.value.id,
          date: selectedDate.value,
          time: selectedTime.value,
          duration: selectedDuration.value
        };
        
        if (hasTimeConflict(testBooking)) {
          errorMessage.value = 'Выбранное время уже занято';
          return;
        }
      }
      
      step.value++;
    };

    const calculateEndTime = () => {
      if (!selectedTime.value || !selectedDuration.value) return '';
      
      const [hours, minutes] = selectedTime.value.split(':').map(Number);
      const endHours = hours + selectedDuration.value;
      return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const formatSelectedDate = () => {
      if (!selectedDate.value) return '';
      
      const [year, month, day] = selectedDate.value.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      return date.toLocaleDateString('ru-RU', options);
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

      if (hasTimeConflict(newBooking)) {
        errorMessage.value = 'Это время стало недоступным. Пожалуйста, выберите другое время.';
        toast.error('Конфликт времени бронирования');
        step.value = 3;
        return;
      }

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
      canProceed,
      canConfirm,
      selectResourceType,
      selectResource,
      onDateSelected,
      onTimeSelected,
      validateAndProceed,
      confirmBooking,
      calculateEndTime,
      formatSelectedDate,
      isDurationDisabled,
      getResourceIcon,
      getHourText,
    };
  },
};
</script>

<style lang="scss" scoped>
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

.booking-header {
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.25rem;
    font-weight: 600;
    color: #0d6efd;
    margin-bottom: 1.5rem;
  }
}

.booking-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: 3rem;
  
  &:before {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 2px;
    background: #e0e0e0;
    z-index: 1;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    cursor: default;
    
    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e0e0e0;
      color: #757575;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
    }
    
    .step-title {
      color: #757575;
      font-size: 0.875rem;
      text-align: center;
      max-width: 100px;
    }
    
    &.active {
      .step-number {
        background: #0d6efd;
        color: white;
        box-shadow: 0 4px 8px rgba(13, 110, 253, 0.2);
      }
      
      .step-title {
        color: #0d6efd;
        font-weight: 500;
      }
    }
  }
}

.booking-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1.5rem;
    font-weight: 500;
  }
}

.step-content {
  animation: fadeIn 0.3s ease;
}

.resource-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.resource-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  border-radius: 8px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.active {
    background: rgba(13, 110, 253, 0.1);
    border-color: #0d6efd;
    
    .type-icon {
      background: #0d6efd;
      color: white;
    }
    
    .type-name {
      color: #0d6efd;
      font-weight: 500;
    }
  }
  
  .type-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    transition: all 0.2s ease;
  }
  
  .type-name {
    font-size: 1rem;
    color: #333;
    text-align: center;
  }
}

.resource-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.resource-card {
  display: flex;
  align-items: flex-start;
  padding: 1.25rem;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  &.active {
    background: rgba(13, 110, 253, 0.05);
    border-color: #0d6efd;
    
    .resource-icon {
      background: #0d6efd;
      color: white;
    }
  }
  
  .resource-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    margin-right: 1rem;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  
  .resource-info {
    flex: 1;
    
    h3 {
      font-size: 1rem;
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    p {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.5rem;
    }
    
    .working-hours {
      display: flex;
      align-items: center;
      font-size: 0.8125rem;
      color: #666;
      
      i {
        margin-right: 0.25rem;
        font-size: 0.875rem;
      }
    }
  }
}

.datetime-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.calendar-section {
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.duration-section {
  h3 {
    font-size: 1.125rem;
    margin-bottom: 1rem;
    color: #333;
  }
}

.duration-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.duration-option {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  background: #f0f0f0;
  border: none;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(.disabled) {
    background: #e0e0e0;
  }
  
  &.active {
    background: #0d6efd;
    color: white;
    box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    text-decoration: line-through;
  }
}

.selected-time-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  
  .time-summary {
    display: grid;
    gap: 1rem;
  }
  
  .time-block {
    display: flex;
    justify-content: space-between;
    
    .time-label {
      color: #666;
      font-weight: 500;
    }
    
    .time-value {
      color: #333;
      font-weight: 500;
    }
  }
  
  .time-placeholder {
    color: #999;
    text-align: center;
    padding: 1rem;
  }
}

.confirmation-step {
  .confirmation-details {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }
  
  .detail-card {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    
    .detail-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: rgba(13, 110, 253, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      color: #0d6efd;
      font-size: 1.25rem;
    }
    
    .detail-info {
      h3 {
        font-size: 0.875rem;
        color: #666;
        margin-bottom: 0.25rem;
      }
      
      p {
        font-size: 1rem;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

.alert {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  font-weight: 500;
  
  i {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }
  
  &.alert-error {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border-left: 4px solid #dc3545;
  }
  
  &.alert-success {
    background: rgba(25, 135, 84, 0.1);
    color: #198754;
    border-left: 4px solid #198754;
  }
}

.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  
  .footer-spacer {
    flex: 1;
  }
}

.btn {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  i {
    margin: 0 0.25rem;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  
  &:hover:not(:disabled) {
    background: #e0e0e0;
  }
}

.btn-primary {
  background: #0d6efd;
  color: white;
  
  &:hover:not(:disabled) {
    background: #0b5ed7;
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
  }
}

.btn-confirm {
  background: #198754;
  color: white;
  
  &:hover:not(:disabled) {
    background: #157347;
    box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .booking-page {
    padding: 1rem;
  }
  
  .booking-steps {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    
    &:before {
      display: none;
    }
    
    .step {
      flex: 0 0 calc(50% - 1rem);
      margin-bottom: 1rem;
    }
  }
  
  .resource-types {
    grid-template-columns: 1fr 1fr;
  }
  
  .resource-list {
    grid-template-columns: 1fr;
  }
  
  .confirmation-details {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 480px) {
  .resource-types {
    grid-template-columns: 1fr;
  }
  
  .booking-footer {
    flex-direction: column-reverse;
    gap: 1rem;
    
    .btn {
      width: 100%;
    }
  }
}
</style>