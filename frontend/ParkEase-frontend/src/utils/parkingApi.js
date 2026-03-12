import axios from 'axios';

const parkingClient = axios.create({
  baseURL: 'http://localhost:8080',
});

export const fetchParkingSlots = async () => {
  const { data } = await parkingClient.get('/api/parking/slots');
  return data;
};

export const fetchParkingBookings = async () => {
  const { data } = await parkingClient.get('/api/parking/bookings');
  return data;
};

export const createParkingBooking = async (payload) => {
  const { data } = await parkingClient.post('/api/parking/bookings', payload);
  return data;
};

export const markParkingBookingPaid = async (bookingId, paymentMethod) => {
  const { data } = await parkingClient.put(`/api/parking/bookings/${bookingId}/payment`, {
    paymentMethod,
  });
  return data;
};
