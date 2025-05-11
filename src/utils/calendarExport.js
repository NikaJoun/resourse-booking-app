export const generateICS = (bookings, store) => {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Booking System//EN',
    'CALSCALE:GREGORIAN'
  ];

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  bookings.forEach(booking => {
    const resourceName = store.getters['resources/getResourceNameById'](booking.resourceId);
    const startDate = new Date(`${booking.date}T${booking.time}`);
    const endDate = new Date(startDate.getTime() + booking.duration * 60 * 60 * 1000);
    
    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${booking.id}@booking-system`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:Бронирование ${resourceName}`,
      `DESCRIPTION:Бронирование ресурса "${resourceName}" на ${booking.date} в ${booking.time}. Продолжительность: ${booking.duration} ч.`,
      `STATUS:${booking.isConfirmed ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

export const downloadICSFile = (icsContent, filename) => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};