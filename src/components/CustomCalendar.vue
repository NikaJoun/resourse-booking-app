<template>
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
            disabled: !day.isCurrentMonth || day.isPast,
            selected: day.date === selectedDate,
            today: day.isToday,
          },
        ]"
        @click="selectDate(day.date)"
      >
        {{ day.day }}
      </div>
    </div>
    <div class="time-picker" v-if="selectedDate">
      <label>Выберите время:</label>
      <select v-model="selectedTime" @change="onTimeSelected">
        <option v-for="time in availableTimes" :key="time" :value="time">
          {{ time }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  setup(props, { emit }) {
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const currentDate = ref(new Date());
    const selectedDate = ref(null);
    const selectedTime = ref('08:00');

    const availableTimes = ref([
      '8:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    ]);

    const currentMonth = computed(() => {
      return currentDate.value.toLocaleString('default', { month: 'long' });
    });

    const currentYear = computed(() => {
      return currentDate.value.getFullYear();
    });

    const days = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
      const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));
      const daysInMonth = lastDayOfMonth.getUTCDate();
      const startDay = firstDayOfMonth.getUTCDay() === 0 ? 6 : firstDayOfMonth.getUTCDay() - 1;

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const daysArray = [];

      for (let i = 0; i < startDay; i++) {
        daysArray.push({ day: '', date: null, isCurrentMonth: false });
      }

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(Date.UTC(year, month, i)).toISOString().split('T')[0];
        const isPast = new Date(date + 'T00:00:00Z') < today;
        const isToday = date === today.toISOString().split('T')[0];
        daysArray.push({ day: i, date, isCurrentMonth: true, isPast, isToday });
      }

      return daysArray;
    });

    const prevMonth = () => {
      currentDate.value = new Date(Date.UTC(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)); // Используем UTC
    };

    const nextMonth = () => {
      currentDate.value = new Date(Date.UTC(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)); // Используем UTC
    };

    const selectDate = (date) => {
      if (date) {
        const selected = new Date(date + 'T00:00:00Z');
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        if (selected >= today) {
          selectedDate.value = date;
          emit('date-selected', date);
        } else {
          alert('Нельзя выбрать прошедшую дату.');
        }
      }
    };

    const onTimeSelected = () => {
      emit('time-selected', selectedTime.value);
    };

    return {
      daysOfWeek,
      currentMonth,
      currentYear,
      days,
      selectedDate,
      selectedTime,
      availableTimes,
      prevMonth,
      nextMonth,
      selectDate,
      onTimeSelected,
    };
  },
};
</script>

<style scoped>
.calendar {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.nav-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #007bff;
  transition: color 0.3s ease;
}

.nav-button:hover {
  color: #0056b3;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day-header {
  text-align: center;
  font-weight: 600;
  color: #666;
  padding: 10px 0;
}

.calendar-day {
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  border: 1px solid #e0e0e0;
}

.calendar-day:hover {
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
}

.calendar-day.today {
  background-color: #e3f2fd;
  color: #007bff;
  font-weight: 600;
}

.time-picker {
  margin-top: 20px;
}

.time-picker label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #333;
}

.time-picker select {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 1rem;
  color: #333;
  background-color: #f8f8f8;
  transition: border-color 0.3s ease;
}

.time-picker select:focus {
  border-color: #007bff;
  outline: none;
}
</style>