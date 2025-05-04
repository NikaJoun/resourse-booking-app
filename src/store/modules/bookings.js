export default {
  namespaced: true,
  state: {
    bookings: JSON.parse(localStorage.getItem('bookings')) || [
      {
        id: 1,
        resourceId: 1,
        date: '2025-05-17',
        time: '10:00',
        duration: 2,
        userId: 3,
        isConfirmed: false,
      },
    ],
  },
  mutations: {
    SET_BOOKINGS(state, bookings) {
      state.bookings = bookings;
      localStorage.setItem('bookings', JSON.stringify(bookings));
    },
    ADD_BOOKING(state, booking) {
      const newBooking = { ...booking, id: Date.now() };
      state.bookings.push(newBooking);
      localStorage.setItem('bookings', JSON.stringify(state.bookings));
    },
    CONFIRM_BOOKING(state, bookingId) {
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.isConfirmed = true;
        localStorage.setItem('bookings', JSON.stringify(state.bookings));
      }
    },
    CANCEL_BOOKING(state, bookingId) {
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.isCancelled = true;
        localStorage.setItem('bookings', JSON.stringify(state.bookings));
      }
    },
    REMOVE_BOOKING(state, bookingId) {
      state.bookings = state.bookings.filter(b => b.id !== bookingId);
      localStorage.setItem('bookings', JSON.stringify(state.bookings));
    },
  },
  actions: {
    addBooking({ commit, state, rootState }, booking) {
      commit('ADD_BOOKING', booking);
      const resource = rootState.resources.resources.find(r => r.id === booking.resourceId);
      const user = rootState.users.users.find(u => u.id === booking.userId);
      
      if (resource?.managerId) {
        commit('notifications/ADD_NOTIFICATION', {
          userId: resource.managerId,
          text: `Новое бронирование "${resource?.name || 'ресурс'}" на ${booking.date} в ${booking.time} от ${user?.username || 'неизвестный'}.`,
          type: 'new-booking'
        }, { root: true });
      }
    },
    confirmBooking({ commit, state, rootState }, bookingId) {
      commit('CONFIRM_BOOKING', bookingId);
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        const resource = rootState.resources.resources.find(r => r.id === booking.resourceId);
        const user = rootState.users.users.find(u => u.id === booking.userId);
        
        commit('notifications/ADD_NOTIFICATION', {
          userId: booking.userId,
          text: `Ваше бронирование "${resource?.name || 'ресурс'}" на ${booking.date} в ${booking.time} подтверждено.`,
          type: 'booking-confirmed'
        }, { root: true });
        
        if (resource?.managerId) {
          commit('notifications/ADD_NOTIFICATION', {
            userId: resource.managerId,
            text: `Вы подтвердили бронирование "${resource?.name || 'ресурс'}" пользователем ${user?.username || 'неизвестный'}.`,
            type: 'manager-confirmation'
          }, { root: true });
        }
      }
    },
    cancelBooking({ commit, state, rootState }, bookingId) {
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        commit('CANCEL_BOOKING', bookingId);
        const resource = rootState.resources.resources.find(r => r.id === booking.resourceId);
        const user = rootState.users.users.find(u => u.id === booking.userId);
        
        commit('notifications/ADD_NOTIFICATION', {
          userId: booking.userId,
          text: `Ваше бронирование "${resource?.name || 'ресурс'}" на ${booking.date} в ${booking.time} отменено.`,
          type: 'booking-cancelled'
        }, { root: true });
        
        if (resource?.managerId) {
          commit('notifications/ADD_NOTIFICATION', {
            userId: resource.managerId,
            text: `Подтвержденное бронирование "${resource?.name || 'ресурс'}" отменено пользователем ${user?.username || 'неизвестный'}.`,
            type: 'booking-cancelled-manager'
          }, { root: true });
        }
      }
    },
  },
  getters: {
    isResourceBooked: state => (resourceId, date, time, duration) => {
      return state.bookings.some(booking => {
        if (booking.resourceId === resourceId && 
            booking.date === date && 
            !booking.isCancelled) {
          const bookingStart = new Date(`${booking.date}T${booking.time}:00`);
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 60 * 1000);
          const newStart = new Date(`${date}T${time}:00`);
          const newEnd = new Date(newStart.getTime() + duration * 60 * 60 * 1000);
          return (
            (newStart >= bookingStart && newStart < bookingEnd) ||
            (newEnd > bookingStart && newEnd <= bookingEnd) ||
            (newStart <= bookingStart && newEnd >= bookingEnd)
          );
        }
        return false;
      });
    },
    pendingBookings: (state, getters, rootState) => {
      try {
        if (!rootState.auth.currentUser || rootState.auth.currentUser.role !== 'manager') return [];
        
        const managedResources = rootState.resources.resources.filter(
          r => r.managerId === rootState.auth.currentUser.id
        );
        
        const managedResourceIds = managedResources.map(r => r.id);
        return state.bookings.filter(b => 
          managedResourceIds.includes(b.resourceId) && 
          !b.isConfirmed &&
          !b.isCancelled
        );
      } catch (error) {
        console.error('Error in pendingBookings getter:', error);
        return [];
      }
    },
    isBookingCompleted: (state) => (booking) => {
      if (!booking) return false;
      const bookingDate = new Date(`${booking.date}T${booking.time}`);
      const now = new Date();
      const endDate = new Date(bookingDate.getTime() + booking.duration * 60 * 60 * 1000);
      return endDate < now;
    },
    userActiveBookings: (state, getters, rootState) => {
      if (!rootState.auth?.currentUser) return [];
      return state.bookings.filter(booking => {
        return booking.userId === rootState.auth.currentUser.id && 
               !booking.isCancelled && 
               !getters.isBookingCompleted(booking);
      });
    },
    userBookingHistory: (state, getters, rootState) => {
      if (!rootState.auth?.currentUser) return [];
      return state.bookings.filter(booking => {
        return booking.userId === rootState.auth.currentUser.id && 
               (booking.isCancelled || getters.isBookingCompleted(booking));
      });
    },
    getBookingsForDate: (state) => (date) => {
      return state.bookings.filter(booking => booking.date === date);
    },
    isDayFullyBooked: (state) => (resourceId, date, workingHours) => {
      const bookingsForDay = state.bookings.filter(
        b => b.resourceId === resourceId && b.date === date && !b.isCancelled
      );
      
      if (bookingsForDay.length === 0) return false;
      
      const workingStart = workingHours.start.split(':').map(Number);
      const workingEnd = workingHours.end.split(':').map(Number);
      const workingStartMinutes = workingStart[0] * 60 + workingStart[1];
      const workingEndMinutes = workingEnd[0] * 60 + workingEnd[1];
      
      const bookedSlots = [];
      bookingsForDay.forEach(booking => {
        const [hours, minutes] = booking.time.split(':').map(Number);
        const start = hours * 60 + minutes;
        const end = start + booking.duration * 60;
        bookedSlots.push({ start, end });
      });
      
      bookedSlots.sort((a, b) => a.start - b.start);
      
      let lastEnd = workingStartMinutes;
      for (const slot of bookedSlots) {
        if (slot.start > lastEnd) {
          return false;
        }
        lastEnd = Math.max(lastEnd, slot.end);
      }
      
      return lastEnd >= workingEndMinutes;
    },
    
    getAvailableTimesForDate: (state, getters) => (resourceId, date, workingHours) => {
      const availableTimes = [];
      const [startHour, startMinute] = workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = workingHours.end.split(':').map(Number);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const time = `${String(hour).padStart(2, '0')}:00`;
        if (!getters.isResourceBooked(resourceId, date, time, 1)) {
          availableTimes.push(time);
        }
      }
      
      return availableTimes;
    },
    getBookingsForResourceAndDate: (state) => (resourceId, date) => {
      return state.bookings.filter(
        booking => booking.resourceId === resourceId && 
                  booking.date === date &&
                  booking.status !== 'cancelled'
      );
    },
    
    isDayFullyBookedForResource: (state) => (resourceId, date, workingHours) => {
      const [startHour] = workingHours.start.split(':').map(Number);
      const [endHour] = workingHours.end.split(':').map(Number);
      
      const activeBookings = state.bookings.filter(
        booking => !booking.isCancelled
      );
      
      const bookingsForDate = activeBookings.filter(
        booking => booking.resourceId === resourceId && 
                  booking.date === date
      );
      
      const allHours = Array.from({length: endHour - startHour}, (_, i) => startHour + i);
      
      return allHours.every(hour => {
        const timeStr = `${String(hour).padStart(2, '0')}:00`;
        
        return bookingsForDate.some(booking => {
          const [bookingHour] = booking.time.split(':').map(Number);
          const bookingEndHour = bookingHour + booking.duration;
          return hour >= bookingHour && hour < bookingEndHour;
        });
      });
    },
    
    isTimeSlotAvailable: (state) => (resourceId, date, time) => {
      const bookingsForDate = state.bookings.filter(
        booking => booking.resourceId === resourceId && 
                  booking.date === date &&
                  !booking.isCancelled // Добавляем проверку на isCancelled
      );
      
      if (bookingsForDate.length === 0) return true;
      
      const [hour] = time.split(':').map(Number);
      const slotStart = hour * 60;
      const slotEnd = (hour + 1) * 60;
      
      return !bookingsForDate.some(booking => {
        const [bookingHour] = booking.time.split(':').map(Number);
        const bookingStart = bookingHour * 60;
        const bookingEnd = bookingStart + (booking.duration * 60);
        
        return (slotStart >= bookingStart && slotStart < bookingEnd) ||
               (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
               (slotStart <= bookingStart && slotEnd >= bookingEnd);
      });
    },
    
    getAvailableTimesForResource: (state, getters) => (resourceId, date, workingHours) => {
      const availableTimes = [];
      const [startHour] = workingHours.start.split(':').map(Number);
      const [endHour] = workingHours.end.split(':').map(Number);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const time = `${String(hour).padStart(2, '0')}:00`;
        if (getters.isTimeSlotAvailable(resourceId, date, time, 1)) {
          availableTimes.push(time);
        }
      }
      
      return availableTimes;
    },
  },
};