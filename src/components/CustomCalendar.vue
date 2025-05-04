<template>
  <div class="calendar-container">
    <div class="calendar">
      <div class="calendar-header">
        <button @click="prevMonth" class="nav-button">&lt;</button>
        <h2>{{ currentMonth }} {{ currentYear }}</h2>
        <button @click="nextMonth" class="nav-button">&gt;</button>
      </div>
      <div class="calendar-grid">
        <div v-for="day in daysOfWeek" :key="day" class="calendar-day-header">
          {{ day }}
        </div>
        <div
          v-for="day in days"
          :key="day.date"
          :class="[
            'calendar-day',
            {
              disabled: day.isDisabled,
              selected: day.date === selectedDate,
              today: day.isToday,
              'has-availability': day.hasAvailability,
            },
          ]"
          @click="selectDate(day.date)"
        >
          {{ day.day }}
          <div v-if="day.hasBookings" class="booking-indicator"></div>
        </div>
      </div>
      <div class="time-picker" v-if="selectedDate && !isDayFullyBooked">
        <label>Выберите время:</label>
        <select v-model="selectedTime" @change="onTimeSelected">
          <option 
            v-for="time in availableTimes" 
            :key="time" 
            :value="time"
          >
            {{ time }}
          </option>
        </select>
      </div>
      <div v-if="selectedDate && isDayFullyBooked" class="fully-booked-message">
        Этот день полностью занят для выбранного ресурса
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';

export default {
  props: {
    resourceId: {
      type: Number,
      required: true
    },
    workingHours: {
      type: Object,
      default: () => ({ start: '08:00', end: '19:00' })
    },
    minDate: {
      type: String,
      default: null
    },
    maxDate: {
      type: String,
      default: null
    }
  },
  
  setup(props, { emit }) {
    const store = useStore();
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const currentDate = ref(new Date());
    const selectedDate = ref(null);
    const selectedTime = ref('08:00');

    const currentMonth = computed(() => {
      return currentDate.value.toLocaleString('ru-RU', { month: 'long' });
    });

    const currentYear = computed(() => {
      return currentDate.value.getFullYear();
    });

    const isDayFullyBooked = computed(() => {
      if (!selectedDate.value || !props.resourceId) return false;
      return store.getters['bookings/isDayFullyBookedForResource'](
        props.resourceId, 
        selectedDate.value, 
        props.workingHours
      );
    });

    const availableTimes = computed(() => {
      if (!selectedDate.value || !props.resourceId) return [];
      
      const now = new Date();
      const isToday = new Date(selectedDate.value + 'T00:00:00').toISOString().split('T')[0] === 
                    new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
      
      const [startHour] = props.workingHours.start.split(':').map(Number);
      const [endHour] = props.workingHours.end.split(':').map(Number);
      
      const availableSlots = [];
      
      for (let hour = startHour; hour < endHour; hour++) {
        if (isToday && hour < now.getHours()) continue;
        
        const timeStr = `${String(hour).padStart(2, '0')}:00`;
        
        // Используем обновленный геттер, который игнорирует отмененные брони
        const isAvailable = store.getters['bookings/isTimeSlotAvailable'](
          props.resourceId,
          selectedDate.value,
          timeStr
        );
        
        if (isAvailable) {
          availableSlots.push(timeStr);
        }
      }
      
      return availableSlots;
    });

    const days = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();
      const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

      // Получаем текущую дату в UTC, чтобы избежать проблем с часовыми поясами
      const today = new Date();
      const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const todayStr = todayUTC.toISOString().split('T')[0];

      const minSelectableDate = props.minDate ? new Date(props.minDate + 'T00:00:00') : null;
      const maxSelectableDate = props.maxDate ? new Date(props.maxDate + 'T00:00:00') : null;

      const daysArray = [];

      // Пустые дни в начале месяца
      for (let i = 0; i < startDay; i++) {
        daysArray.push({ 
          day: '', 
          date: null, 
          isToday: false,
          isDisabled: true,
          hasAvailability: false
        });
      }

      // Дни месяца
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dateUTC = new Date(Date.UTC(year, month, i));
        const dateStr = dateUTC.toISOString().split('T')[0];
        
        const isToday = dateStr === todayStr;
        const isPast = dateUTC < todayUTC;
        const isBeforeMin = minSelectableDate && dateUTC < minSelectableDate;
        const isAfterMax = maxSelectableDate && dateUTC > maxSelectableDate;
        
        const hasBookings = store.getters['bookings/getBookingsForResourceAndDate'](
          props.resourceId, 
          dateStr
        ).length > 0;
        
        const hasAvailability = props.resourceId ? 
          !store.getters['bookings/isDayFullyBookedForResource'](
            props.resourceId, 
            dateStr, 
            props.workingHours
          ) : false;

        daysArray.push({ 
          day: i, 
          date: dateStr, 
          isToday, 
          isPast,
          isDisabled: isPast || isBeforeMin || isAfterMax || !hasAvailability,
          hasBookings,
          hasAvailability
        });
      }

      return daysArray;
    });

    const prevMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(), 
        currentDate.value.getMonth() - 1, 
        1
      );
    };

    const nextMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(), 
        currentDate.value.getMonth() + 1, 
        1
      );
    };

    const selectDate = (date) => {
      if (!date) return;
      
      const [year, month, day] = date.split('-').map(Number);
      const selectedDateObj = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const minSelectableDate = props.minDate ? new Date(props.minDate + 'T00:00:00') : null;
      const maxSelectableDate = props.maxDate ? new Date(props.maxDate + 'T00:00:00') : null;
      
      if (selectedDateObj < today) {
        alert('Нельзя выбрать прошедшую дату.');
        return;
      }
      
      if (minSelectableDate && selectedDateObj < minSelectableDate) {
        alert(`Минимальная доступная дата: ${minSelectableDate.toLocaleDateString('ru-RU')}`);
        return;
      }
      
      if (maxSelectableDate && selectedDateObj > maxSelectableDate) {
        alert(`Максимальная доступная дата: ${maxSelectableDate.toLocaleDateString('ru-RU')}`);
        return;
      }

      selectedDate.value = date;
      emit('date-selected', date);
      
      if (availableTimes.value.length > 0) {
        selectedTime.value = availableTimes.value[0];
        emit('time-selected', selectedTime.value);
      }
    };

    const onTimeSelected = () => {
      if (selectedDate.value && selectedTime.value) {
        emit('time-selected', selectedTime.value);
      }
    };

    watch(() => props.resourceId, () => {
      currentDate.value = new Date();
      selectedDate.value = null;
      selectedTime.value = '08:00';
    });

    return {
      daysOfWeek,
      currentMonth,
      currentYear,
      days,
      selectedDate,
      selectedTime,
      availableTimes,
      isDayFullyBooked,
      prevMonth,
      nextMonth,
      selectDate,
      onTimeSelected,
    };
  },
};
</script>

<style scoped>
/* Стили остаются такими же, как в предыдущем примере */
.calendar-container {
  width: 100%;
  overflow: hidden;
}

.calendar {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  text-transform: capitalize;
  margin: 0;
}

.nav-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #007bff;
  transition: color 0.3s ease;
  padding: 0 0.5rem;
  line-height: 1;
}

.nav-button:hover {
  color: #0056b3;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day-header {
  text-align: center;
  font-weight: 600;
  color: #666;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.calendar-day {
  position: relative;
  text-align: center;
  padding: 0.75rem 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.calendar-day:hover:not(.disabled) {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.calendar-day.disabled {
  background-color: #f8f8f8;
  cursor: not-allowed;
  color: #ccc;
  border: none;
}

.calendar-day.selected {
  background-color: #007bff;
  color: white;
  border: none;
  font-weight: 600;
}

.calendar-day.today {
  background-color: #e3f2fd;
  color: #007bff;
  font-weight: 600;
  border: 1px solid #007bff;
}

.calendar-day.has-availability:not(.disabled) {
  background-color: #e8f5e9;
}

.time-picker {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.time-picker label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.time-picker select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 1rem;
  color: #333;
  background-color: #f8f8f8;
  transition: border-color 0.3s ease;
  cursor: pointer;
}

.time-picker select:focus {
  border-color: #007bff;
  outline: none;
}

.booking-indicator {
  position: absolute;
  bottom: 0.25rem;
  left: 50%;
  transform: translateX(-50%);
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #28a745;
}

.calendar-day.selected .booking-indicator {
  background-color: white;
}

.fully-booked-message {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
}
</style>