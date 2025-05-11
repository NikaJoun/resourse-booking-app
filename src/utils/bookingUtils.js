import { 
  isBookingExpired,
  formatLongDate,
  calculateEndTime
} from './dateUtils';

export const isBookingCompleted = (booking) => {
  if (!booking) return false;
  const bookingEnd = new Date(`${booking.date}T${booking.time}`);
  bookingEnd.setHours(bookingEnd.getHours() + booking.duration);
  return new Date() > bookingEnd;
};

export const filterBookings = (bookings, resourceFilter, dateFrom, dateTo, statusFilter) => {
  return bookings.filter(booking => {
    if (resourceFilter && booking.resourceId !== resourceFilter) {
      return false;
    }
    
    if (dateFrom && booking.date < dateFrom) {
      return false;
    }
    if (dateTo && booking.date > dateTo) {
      return false;
    }

    if (statusFilter) {
      const isCompleted = isBookingCompleted(booking);
      const isExpired = isBookingExpired(booking);
      
      if (statusFilter === 'pending' && booking.isConfirmed) {
        return false;
      }
      if (statusFilter === 'confirmed' && (!booking.isConfirmed || booking.isCancelled || isCompleted)) {
        return false;
      }
      if (statusFilter === 'completed' && !isCompleted) {
        return false;
      }
      if (statusFilter === 'cancelled' && !booking.isCancelled) {
        return false;
      }
      if (statusFilter === 'expired' && !isExpired) {
        return false;
      }
    }
    
    return true;
  });
};

export const getBookingStatusClass = (booking) => {
  if (!booking) return '';
  if (booking.isCancelled) return 'cancelled';
  if (isBookingCompleted(booking)) return 'completed';
  if (isBookingExpired(booking)) return 'expired';
  return booking.isConfirmed ? 'confirmed' : 'pending';
};

export const getBookingIcon = (booking) => {
  if (!booking) return 'bi bi-question-circle';
  if (booking.isCancelled) return 'bi bi-x-circle';
  if (isBookingCompleted(booking)) return 'bi bi-check-circle';
  if (isBookingExpired(booking)) return 'bi bi-clock-history';
  return booking.isConfirmed ? 'bi bi-check-circle' : 'bi bi-clock';
};

export const getStatusText = (booking) => {
  if (!booking) return 'Неизвестный статус';
  if (booking.isCancelled) return 'Отменено';
  if (isBookingCompleted(booking)) return 'Завершено';
  if (isBookingExpired(booking)) return 'Просрочено';
  return booking.isConfirmed ? 'Подтверждено' : 'Ожидает подтверждения';
};

export const getStatusTextClass = (booking) => {
  if (!booking) return '';
  if (booking.isCancelled) return 'text-danger';
  if (isBookingCompleted(booking)) return 'text-success';
  if (isBookingExpired(booking)) return 'text-warning';
  return booking.isConfirmed ? 'text-success' : 'text-warning';
};

export function getBookingTimeRange(booking) {
  const endTime = calculateEndTime(booking.time, booking.duration);
  return `${booking.time} - ${endTime}`;
}