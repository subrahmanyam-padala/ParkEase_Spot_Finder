import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createBooking as createBookingApi,
  createPaymentOrder,
  getMyBookings,
  loginUser,
  verifyPayment,
} from '../services/parkeaseApi';

const USER_KEY = 'parkease_user';
const TOKEN_KEY = 'parkease_token';
const BOOKINGS_KEY = 'parkease_bookings';

const AppContext = createContext();

const normalizeRole = (role) => (role || 'USER').toLowerCase();

const mapBookingFromApi = (booking) => {
  const startTime = booking?.startTime ? new Date(booking.startTime) : null;
  const endTime = booking?.endTime ? new Date(booking.endTime) : null;
  const durationMs =
    startTime && endTime ? Math.max(0, endTime.getTime() - startTime.getTime()) : 0;
  const durationHours = durationMs > 0 ? Math.max(1, Math.round(durationMs / 3600000)) : 0;
  const status = booking?.status || 'UNKNOWN';

  return {
    id: booking?.bookingId,
    bookingId: booking?.bookingId,
    ticketNumber: booking?.ticketNumber,
    slot: booking?.spotLabel,
    zone: booking?.zone,
    vehicleNumber: booking?.vehicleNumber,
    duration: durationHours,
    amount: booking?.totalAmount || 0,
    baseFee: booking?.baseFee || 0,
    surgeFee: booking?.surgeFee || 0,
    status,
    paid: ['PAID', 'COMPLETED'].includes(status.toUpperCase()),
    validUntil: endTime
      ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '--',
    createdAt: startTime ? startTime.toISOString() : new Date().toISOString(),
    expiresAt: endTime ? endTime.toISOString() : null,
    qrCodeUrl: booking?.qrCodeUrl || '',
    navigationPath: booking?.navigationPath || '',
    userName: booking?.userName || '',
    userEmail: booking?.userEmail || '',
  };
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const persistBookings = (nextBookings) => {
    setBookings(nextBookings);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(nextBookings));
  };

  const refreshBookings = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      persistBookings([]);
      return [];
    }

    const apiBookings = await getMyBookings();
    const mapped = (apiBookings || []).map(mapBookingFromApi);
    persistBookings(mapped);
    return mapped;
  };

  const login = async ({ username, password }) => {
    const response = await loginUser({ username, password });

    const userData = {
      username: response.username,
      name: response.username,
      role: normalizeRole(response.role),
      token: response.token,
    };

    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, response.token);

    try {
      await refreshBookings();
    } catch {
      // Session is still valid even if booking sync fails.
    }
    return userData;
  };

  const logout = () => {
    setUser(null);
    setBookings([]);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(BOOKINGS_KEY);
  };

  const createBooking = async ({ spotId, vehicleNumber, durationHours }) => {
    const created = await createBookingApi({ spotId, vehicleNumber, durationHours });
    const mappedBooking = mapBookingFromApi(created);
    setBookings((previous) => {
      const next = [...previous, mappedBooking];
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
      return next;
    });
    return mappedBooking;
  };

  const processPayment = async (bookingId, paymentMethod = 'UPI') => {
    const order = await createPaymentOrder({ bookingId, paymentMethod });
    await verifyPayment({
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: `mock_pay_${Date.now()}`,
      razorpaySignature: 'mock_signature_valid',
    });
    await refreshBookings();
    return order;
  };

  const updateBooking = (bookingId, updates) => {
    const bookingIdAsNumber = Number(bookingId);
    const updatedBookings = bookings.map((booking) =>
      Number(booking.id) === bookingIdAsNumber ||
      Number(booking.bookingId) === bookingIdAsNumber
        ? { ...booking, ...updates }
        : booking
    );
    persistBookings(updatedBookings);
  };

  const getBooking = (bookingId) => {
    const bookingIdAsNumber = Number(bookingId);
    return bookings.find(
      (booking) =>
        Number(booking.id) === bookingIdAsNumber ||
        Number(booking.bookingId) === bookingIdAsNumber
    );
  };

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem(USER_KEY);
      const storedBookings = localStorage.getItem(BOOKINGS_KEY);

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            ...parsedUser,
            role: normalizeRole(parsedUser?.role),
          });
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      if (storedBookings) {
        try {
          setBookings(JSON.parse(storedBookings));
        } catch {
          localStorage.removeItem(BOOKINGS_KEY);
        }
      }

      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          await refreshBookings();
        } catch {
          // Ignore hydration sync errors; UI still works with cached state.
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  const value = {
    user,
    login,
    logout,
    bookings,
    refreshBookings,
    createBooking,
    processPayment,
    updateBooking,
    getBooking,
    loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
