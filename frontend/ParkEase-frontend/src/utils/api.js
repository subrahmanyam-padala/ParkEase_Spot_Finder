import axios from 'axios';

const API_HOST = window.location.hostname;
const API_BASE = `http://${API_HOST}:8080/api`;

const API = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('parkease_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('parkease_token');
      localStorage.removeItem('parkease_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

/* ==================== AUTH ==================== */
export const sendOtp = (email) => API.post('/auth/send-otp', { email });
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (username, password) => API.post('/auth/login', { username, password });

/* ==================== PARKING SPOTS ==================== */
export const getAvailableSpots = () => API.get('/spots/available');
export const getAvailableByZone = (zone) => API.get(`/spots/available/zone/${zone}`);
export const getEvSpots = () => API.get('/spots/available/ev');
export const getZones = () => API.get('/spots/zones');
export const getSpotStats = () => API.get('/spots/stats');
export const getAllSpots = () => API.get('/spots');
export const getSpotById = (id) => API.get(`/spots/${id}`);

/* ==================== BOOKINGS ==================== */
export const createBooking = (data) => API.post('/bookings', data);
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const getBookingByTicket = (ticket) => API.get(`/bookings/ticket/${ticket}`);
export const getMyBookings = () => API.get('/bookings/my-bookings');
export const getMyActiveBookings = () => API.get('/bookings/my-bookings/active');
export const completeBooking = (id) => API.post(`/bookings/${id}/complete`);
export const cancelBooking = (id) => API.post(`/bookings/${id}/cancel`);

/* ==================== PAYMENTS ==================== */
export const createPaymentOrder = (bookingId, paymentMethod) =>
  API.post('/payments/create-order', { bookingId, paymentMethod });
export const verifyPayment = (data) => API.post('/payments/verify', data);
export const getMyPayments = () => API.get('/payments/my-payments');
export const getPaymentsByBooking = (bookingId) => API.get(`/payments/booking/${bookingId}`);

/* ==================== CHATBOT ==================== */
export const sendChatMessage = (message, userId) =>
  API.post('/chatbot/message', { message, userId });
export const getChatWelcome = () => API.get('/chatbot/welcome');

/* ==================== PRICING ==================== */
export const getPricing = () => API.get('/admin/pricing');
export const calculatePrice = (hours) => API.get(`/admin/pricing/calculate?hours=${hours}`);
export const getSurgeStatus = () => API.get('/admin/pricing/surge-status');

/* ==================== SCANNER ==================== */
export const scanQrCode = (qrData) => API.post('/scan', { qrData });
export const payOverstay = (ticketNumber) => API.post('/scan/pay-overstay', { ticketNumber });
export const getTicketStatus = (ticketNumber) => API.get(`/scan/status/${ticketNumber}`);

/* ==================== COMPLAINTS ==================== */
export const createComplaint = (data) => API.post('/complaints', data);
export const getMyComplaints = () => API.get('/complaints/my-complaints');
export const getAllComplaints = () => API.get('/complaints/all');
export const respondToComplaint = (id, data) => API.put(`/complaints/${id}/respond`, data);

/* ==================== FORGOT PASSWORD ==================== */
export const resetPassword = (data) => API.post('/auth/reset-password', data);

/* ==================== USER OVERSTAY PAYMENT ==================== */
export const payOverstayByUser = (ticketNumber) => API.post('/scan/pay-overstay', { ticketNumber });

/* ==================== LEGACY PARKING API (for backward compat) ==================== */
export const fetchParkingSlots = async () => {
  const { data } = await API.get('/parking/slots');
  return data;
};
export const fetchParkingBookings = async () => {
  const { data } = await API.get('/parking/bookings');
  return data;
};
export const createParkingBooking = async (payload) => {
  const { data } = await API.post('/parking/bookings', payload);
  return data;
};
export const markParkingBookingPaid = async (bookingId, paymentMethod) => {
  const { data } = await API.put(`/parking/bookings/${bookingId}/payment`, { paymentMethod });
  return data;
};

export default API;

