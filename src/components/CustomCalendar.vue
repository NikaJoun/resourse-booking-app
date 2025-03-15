<template>
  <div class="calendar">
    <div class="calendar-header">
      <button @click="prevMonth">&lt;</button>
      <h2>{{ currentMonth }} {{ currentYear }}</h2>
      <button @click="nextMonth">&gt;</button>
    </div>
    <div class="calendar-grid">
      <div v-for="day in daysOfWeek" :key="day" class="calendar-day-header">
        {{ day }}
      </div>
      <div
        v-for="day in days"
        :key="day.date"
        :class="['calendar-day', { 'disabled': !day.isCurrentMonth || day.isPast, 'selected': day.date === selectedDate }]"
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
    const selectedTime = ref('09:00');

    // Доступные временные слоты
    const availableTimes = ref([
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    ]);

    // Текущий месяц и год
    const currentMonth = computed(() => {
      return currentDate.value.toLocaleString('default', { month: 'long' });
    });

    const currentYear = computed(() => {
      return currentDate.value.getFullYear();
    });

    // Дни месяца
    const days = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();
      const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Начинаем с понедельника

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Убираем время, чтобы сравнивать только даты

      const daysArray = [];

      // Добавляем пустые дни для начала месяца
      for (let i = 0; i < startDay; i++) {
        daysArray.push({ day: '', date: null, isCurrentMonth: false });
      }

      // Добавляем дни месяца
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i).toISOString().split('T')[0];
        const isPast = new Date(date) < today; // Проверяем, прошла ли дата
        daysArray.push({ day: i, date, isCurrentMonth: true, isPast });
      }

      return daysArray;
    });

    // Переход к предыдущему месяцу
    const prevMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
    };

    // Переход к следующему месяцу
    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
    };

    // Выбор даты
    const selectDate = (date) => {
      if (date) {
        const selected = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Убираем время, чтобы сравнивать только даты

        if (selected >= today) {
          selectedDate.value = date;
          emit('date-selected', date); // Передаем выбранную дату в родительский компонент
        } else {
          alert('Нельзя выбрать прошедшую дату.');
        }
      }
    };

    // Выбор времени
    const onTimeSelected = () => {
      emit('time-selected', selectedTime.value); // Передаем выбранное время в родительский компонент
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
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow-y: auto; /* Добавляем прокрутку, если контент не помещается */
  max-height: 500px; /* Ограничиваем высоту календаря */
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.calendar-header button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.calendar-day-header {
  text-align: center;
  font-weight: bold;
}

.calendar-day {
  text-align: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.calendar-day.disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
  color: #ccc; /* Серый цвет для неактивных дней */
}

.calendar-day.selected {
  background-color: #007bff;
  color: white;
}

.time-picker {
  margin-top: 20px;
}

.time-picker label {
  display: block;
  margin-bottom: 10px;
}

.time-picker select {
  width: 100%;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>