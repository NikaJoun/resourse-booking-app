<template>
  <div class="step-content">
    <h2>Выберите дату и время</h2>
    <div class="datetime-selection">
      <div class="calendar-section">
        <CustomCalendar
          v-if="resource"
          @date-selected="onDateSelected"
          @time-selected="onTimeSelected"
          :resourceId="resource.id"
          :workingHours="resource.workingHours || defaultWorkingHours"
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
            @click="updateDuration(hour)"
            :class="['duration-option', { active: duration === hour, disabled: isDurationDisabled(hour) }]"
            :disabled="isDurationDisabled(hour)"
          >
            {{ hour }} {{ getHourText(hour) }}
          </button>
        </div>
        <div class="selected-time-info">
          <div v-if="date && time" class="time-summary">
            <div class="time-block">
              <span class="time-label">Начало:</span>
              <span class="time-value">{{ time }}, {{ formattedDate }}</span>
            </div>
            <div class="time-block">
              <span class="time-label">Окончание:</span>
              <span class="time-value">{{ endTime }}</span>
            </div>
          </div>
          <div v-else class="time-placeholder">
            Выберите дату и время
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import CustomCalendar from '@/components/booking/CustomCalendar.vue';
import { getHourText, calculateEndTime, formatSelectedDate, defaultWorkingHours } from '@/utils/booking';

export default {
  components: {
    CustomCalendar
  },
  props: {
    resource: {
      type: Object,
      default: null
    },
    date: {
      type: String,
      default: ''
    },
    time: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 1
    }
  },
  emits: ['update:date', 'update:time', 'update:duration'],
  setup(props, { emit }) {
    const minSelectableDate = new Date().toISOString().split('T')[0];
    const maxSelectableDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const availableDurations = ref([1, 2, 3, 4]);
    
    const formattedDate = computed(() => {
      return formatSelectedDate(props.date);
    });
    
    const endTime = computed(() => {
      return calculateEndTime(props.time, props.duration);
    });
    
    const isDurationDisabled = (hour) => {
      if (!props.time || !props.resource) return false;
      
      const workingHours = props.resource.workingHours || defaultWorkingHours;
      const [selectedHour] = props.time.split(':').map(Number);
      const [endHour] = workingHours.end.split(':').map(Number);
      
      return selectedHour + hour > endHour;
    };
    
    const onDateSelected = (date) => {
      emit('update:date', date);
    };
    
    const onTimeSelected = (time) => {
      emit('update:time', time);
    };
    
    const updateDuration = (hour) => {
      emit('update:duration', hour);
    };
    
    watch(() => props.duration, (newVal) => {
      if (isDurationDisabled(newVal)) {
        emit('update:duration', 1);
      }
    });
    
    return {
      minSelectableDate,
      maxSelectableDate,
      availableDurations,
      formattedDate,
      endTime,
      isDurationDisabled,
      onDateSelected,
      onTimeSelected,
      updateDuration,
      getHourText,
      defaultWorkingHours
    };
  }
};
</script>

<style scoped>
.datetime-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
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

.duration-section h3 {
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: #333;
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
}

.duration-option:hover:not(.disabled) {
  background: #e0e0e0;
}

.duration-option.active {
  background: #0d6efd;
  color: white;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
}

.duration-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  text-decoration: line-through;
}

.selected-time-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.time-summary {
  display: grid;
  gap: 1rem;
}

.time-block {
  display: flex;
  justify-content: space-between;
}

.time-label {
  color: #666;
  font-weight: 500;
}

.time-value {
  color: #333;
  font-weight: 500;
}

.time-placeholder {
  color: #999;
  text-align: center;
  padding: 1rem;
}

@media (max-width: 900px) {
  .datetime-selection {
    grid-template-columns: 1fr;
  }
}
</style>