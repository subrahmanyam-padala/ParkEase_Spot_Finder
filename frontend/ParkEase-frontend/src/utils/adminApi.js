import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8080`;
const ADMIN_SESSION_KEY = 'parkease_admin_session';

const adminClient = axios.create({
  baseURL: API_BASE_URL,
});

adminClient.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'null');
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
  return config;
});

export const adminLogin = async (payload) => {
  const { data } = await adminClient.post('/api/admin/auth/login', payload);
  return data;
};

export const adminRegister = async (payload) => {
  const { data } = await adminClient.post('/api/admin/auth/register', payload);
  return data;
};

export const adminResetPassword = async (payload) => {
  const { data } = await adminClient.post('/api/admin/auth/reset-password', payload);
  return data;
};

export const fetchAdminProfile = async () => {
  const { data } = await adminClient.get('/api/admin/auth/me');
  return data;
};

export const fetchAdminOverview = async () => {
  const { data } = await adminClient.get('/api/admin/overview');
  return data;
};

export const fetchAdminSlots = async () => {
  const { data } = await adminClient.get('/api/admin/slots');
  return data;
};

export const createAdminSlot = async (payload) => {
  const { data } = await adminClient.post('/api/admin/slots', payload);
  return data;
};

export const updateAdminSlot = async (slotId, payload) => {
  const { data } = await adminClient.put(`/api/admin/slots/${slotId}`, payload);
  return data;
};

export const fetchAdminBookings = async () => {
  const { data } = await adminClient.get('/api/admin/bookings');
  return data;
};

export const fetchAdminUsers = async () => {
  const { data } = await adminClient.get('/api/admin/users');
  return data;
};

export const fetchAdminUsersList = async () => {
  const { data } = await adminClient.get('/api/admin/admin-users');
  return data;
};

export const fetchAdminRevenue = async () => {
  const { data } = await adminClient.get('/api/admin/revenue');
  return data;
};

export const fetchAdminReports = async () => {
  const { data } = await adminClient.get('/api/admin/reports');
  return data;
};

export const fetchAdminAlerts = async () => {
  const { data } = await adminClient.get('/api/admin/alerts');
  return data;
};

export const dismissAdminAlert = async (alertId) => {
  const { data } = await adminClient.delete(`/api/admin/alerts/${alertId}`);
  return data;
};
