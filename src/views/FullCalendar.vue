<template>
    <div class="calendar-page">
      <!-- Заголовок и фильтры -->
      <div class="filters">
        <h1>Календарь бронирований</h1>
        <div class="filter-controls">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по ресурсу..."
            class="search-input"
          />
          <select v-model="selectedResource" class="resource-select">
            <option value="">Все ресурсы</option>
            <option v-for="resource in resources" :key="resource.id" :value="resource.id">
              {{ resource.name }}
            </option>
          </select>
          <input
            v-model="selectedDate"
            type="date"
            class="date-input"
          />
        </div>
      </div>
  
      <!-- Сообщение о необходимости фильтров -->
      <div v-if="!showCalendar" class="alert alert-info">
        Пожалуйста, воспользуйтесь поиском или фильтрами, чтобы отобразить календарь.
      </div>
  
      <!-- Календарь -->
      <div v-if="showCalendar" class="calendar">
        <table>
          <thead>
            <tr>
              <th>Время</th>
              <th v-for="day in days" :key="day">{{ day }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="timeSlot in timeSlots" :key="timeSlot">
              <td>{{ timeSlot }}</td>
              <td
                v-for="day in days"
                :key="day"
                :class="getCellClass(day, timeSlot)"
                @click="handleCellClick(day, timeSlot)"
              >
                <div v-for="booking in getBookingsForCell(day, timeSlot)" :key="booking.id" class="booking">
                 ({{ booking.userName || `Пользователь ${booking.userId}` }})
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
    import { ref, computed, watch } from 'vue';
    import { useStore } from 'vuex';

    export default {
    setup() {
        const store = useStore();

        // Данные для фильтрации
        const searchQuery = ref('');
        const selectedResource = ref('');
        const selectedDate = ref('');

        // Ресурсы и бронирования
        const resources = computed(() => store.state.resources);
        const bookings = computed(() =>
        store.state.bookings.filter(
            (booking) => !booking.isCancelled // Исключаем отмененные бронирования
        )
        );

        // Показывать ли календарь
        const showCalendar = computed(() => {
        return selectedResource.value || selectedDate.value;
        });

        // Фильтрация бронирований
        const filteredBookings = computed(() => {
        return bookings.value.filter((booking) => {
            const resource = store.getters.getResourceNameById(booking.resourceId);
            const matchesSearch = resource.toLowerCase().includes(searchQuery.value.toLowerCase());
            const matchesResource = selectedResource.value ? booking.resourceId === selectedResource.value : true;
            const matchesDate = selectedDate.value ? booking.date === selectedDate.value : true;
            return matchesSearch && matchesResource && matchesDate;
        });
        });

        // Дни недели
        const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

        // Временные слоты (с 7:00 до 19:00)
        const timeSlots = Array.from({ length: 12 }, (_, i) => {
        const hour = i + 7; // Начинаем с 7:00
        return `${String(hour).padStart(2, '0')}:00`;
        });

        // Получение бронирований для ячейки
        const getBookingsForCell = (day, timeSlot) => {
        const date = selectedDate.value || new Date().toISOString().split('T')[0];
        return filteredBookings.value.filter((booking) => {
            const bookingDate = new Date(booking.date);
            const bookingDay = days[bookingDate.getDay() - 1]; // Приводим к формату дней недели
            const bookingTime = booking.time.split(':')[0] + ':00';
            const bookingEndTime = addHours(booking.time, booking.duration).split(':')[0] + ':00';
            return (
            bookingDay === day &&
            timeSlot >= bookingTime &&
            timeSlot < bookingEndTime
            );
        }).map((booking) => ({
            ...booking,
            resourceName: store.getters.getResourceNameById(booking.resourceId),
            userName: store.getters.getUserNameById(booking.userId), // Используем геттер для получения имени пользователя
        }));
        };

        // Класс для ячейки
        const getCellClass = (day, timeSlot) => {
        const bookings = getBookingsForCell(day, timeSlot);
        if (bookings.length > 0) {
            return bookings.some((booking) => booking.isConfirmed) ? 'confirmed' : 'pending';
        }
        return '';
        };

        // Обработка клика по ячейке
        const handleCellClick = (day, timeSlot) => {
        console.log('Выбрана ячейка:', day, timeSlot);
        };

        // Вспомогательная функция для добавления часов
        const addHours = (time, hours) => {
        const [hour, minute] = time.split(':').map(Number);
        const totalMinutes = hour * 60 + minute + hours * 60;
        const newHour = Math.floor(totalMinutes / 60) % 24;
        const newMinute = totalMinutes % 60;
        return `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
        };

        return {
        searchQuery,
        selectedResource,
        selectedDate,
        resources,
        days,
        timeSlots,
        showCalendar,
        getBookingsForCell,
        getCellClass,
        handleCellClick,
        };
    },
    };
  </script>
  
  <style lang="scss" scoped>
  .calendar-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .filters {
    margin-bottom: 20px;
  
    h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
  
    .filter-controls {
      display: flex;
      gap: 10px;
  
      .search-input,
      .resource-select,
      .date-input {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
      }
    }
  }
  
  .alert-info {
    background-color: #d1ecf1;
    color: #0c5460;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #bee5eb;
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .calendar {
    overflow-x: auto;
  
    table {
      width: 100%;
      border-collapse: collapse;
  
      th,
      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
      }
  
      th {
        background-color: #f4f4f4;
      }
  
      td {
        height: 60px;
        vertical-align: top;
  
        &.confirmed {
          background-color: #d4edda;
        }
  
        &.pending {
          background-color: #fff3cd;
        }
  
        .booking {
          background-color: #f8f9fa;
          padding: 4px;
          margin: 2px;
          border-radius: 4px;
          font-size: 12px;
  
          strong {
            font-weight: bold;
          }
        }
      }
    }
  }
  </style>