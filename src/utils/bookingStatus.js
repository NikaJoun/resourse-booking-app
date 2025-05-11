export const isBookingCompleted = (booking, store) => {
  if (!booking || !store) return false;
  const bookingEnd = new Date(`${booking.date}T${booking.time}`);
  bookingEnd.setHours(bookingEnd.getHours() + booking.duration);
  return new Date() > bookingEnd;
};