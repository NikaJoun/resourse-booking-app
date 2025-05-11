export const resourceTypes = [
  { value: 'photographer', label: 'Фотограф', icon: 'bi bi-camera' },
  { value: 'conference_room', label: 'Конференц-зал', icon: 'bi bi-building' },
  { value: 'equipment', label: 'Оборудование', icon: 'bi bi-pc-display' },
];

export const defaultWorkingHours = { start: '08:00', end: '19:00' };

export const getResourceIcon = (type) => {
  const typeObj = resourceTypes.find(t => t.value === type);
  return typeObj ? typeObj.icon : 'bi bi-pc-display';
};

export const getHourText = (hours) => {
  if (hours === 1) return 'час';
  if (hours < 5) return 'часа';
  return 'часов';
};

export const formatSelectedDate = (dateStr) => {
  if (!dateStr) return '';
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('ru-RU', options);
};

export const calculateEndTime = (startTime, duration) => {
  if (!startTime || !duration) return '';
  
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = hours + duration;
  return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const hasTimeConflict = (newBooking, existingBookings) => {
  const bookingsForResource = existingBookings.filter(
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