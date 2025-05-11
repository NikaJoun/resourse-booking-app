export function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function formatDayDate(dateString) {
  const date = new Date(dateString);
  return date.getDate();
}

export function calculateEndTime(startTime, duration) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = hours + duration;
  return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function getBookingTimeRange(booking) {
  if (!booking || !booking.time || !booking.duration) return '';
  const endTime = calculateEndTime(booking.time, booking.duration);
  return `${booking.time} - ${endTime}`;
}

export function isBookingExpired(booking) {
  const bookingDate = new Date(`${booking.date}T${booking.time}`);
  return bookingDate < new Date();
}

export function formatLongDate(dateString) {
  if (!dateString) return '';
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  } catch {
    return dateString;
  }
}

export function isDateInRange(date, startDate, endDate) {
  if (!date) return false;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}