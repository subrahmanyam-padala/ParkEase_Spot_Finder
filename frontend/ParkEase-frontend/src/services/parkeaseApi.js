import apiClient from './apiClient';

const unwrap = (response) => response.data;

export const loginUser = async ({ username, password }) => {
  const response = await apiClient.post('/api/auth/login', { username, password });
  return unwrap(response);
};

export const sendOtp = async (email) => {
  const response = await apiClient.post('/api/auth/send-otp', { email });
  return unwrap(response);
};

export const registerUser = async (payload) => {
  const response = await apiClient.post('/api/auth/register', payload);
  return unwrap(response);
};

export const getAllSpots = async () => {
  const response = await apiClient.get('/api/spots');
  return unwrap(response);
};

export const getAvailableSpots = async () => {
  const response = await apiClient.get('/api/spots/available');
  return unwrap(response);
};

export const getSpotStats = async () => {
  const response = await apiClient.get('/api/spots/stats');
  return unwrap(response);
};

export const createBooking = async ({ spotId, vehicleNumber, durationHours }) => {
  const response = await apiClient.post('/api/bookings', {
    spotId,
    vehicleNumber,
    durationHours,
  });
  return unwrap(response);
};

export const getMyBookings = async () => {
  const response = await apiClient.get('/api/bookings/my-bookings');
  return unwrap(response);
};

export const getMyActiveBookings = async () => {
  const response = await apiClient.get('/api/bookings/my-bookings/active');
  return unwrap(response);
};

export const getBookingById = async (bookingId) => {
  const response = await apiClient.get(`/api/bookings/${bookingId}`);
  return unwrap(response);
};

export const createPaymentOrder = async ({ bookingId, paymentMethod }) => {
  const response = await apiClient.post('/api/payments/create-order', {
    bookingId,
    paymentMethod,
  });
  return unwrap(response);
};

export const verifyPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const response = await apiClient.post('/api/payments/verify', {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
  return unwrap(response);
};

export const getCurrentOccupancy = async () => {
  const response = await apiClient.get('/api/admin/occupancy/current');
  return unwrap(response);
};

export const getSurgeStatus = async () => {
  const response = await apiClient.get('/api/admin/pricing/surge-status');
  return unwrap(response);
};

export const getCalculatedPrice = async (hours) => {
  const response = await apiClient.get('/api/admin/pricing/calculate', {
    params: { hours },
  });
  return unwrap(response);
};
