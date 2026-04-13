import axios from 'axios';
import { BASE_URL } from '../config';

const parkingClient = axios.create({
  baseURL: BASE_URL,
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
