import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_SLOTS } from '../data/defaultSlots';
import {
  createParkingBooking,
  fetchParkingBookings,
  fetchParkingSlots,
  markParkingBookingPaid,
} from '../utils/parkingApi';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const normalizeSlots = (rawSlots = []) =>
  rawSlots.map((slot) => ({
    ...slot,
    pricePerHour: Number(slot.pricePerHour) || 75,
    floor: slot.floor || 'Ground',
    status: slot.status || 'available',
  }));

const normalizeBookings = (rawBookings = []) =>
  rawBookings.map((booking) => ({
    ...booking,
    user: booking.user || booking.userName || 'Guest',
    userEmail: booking.userEmail || '',
    amount: Number(booking.amount) || 0,
    pricePerHour: Number(booking.pricePerHour) || 0,
    paid: Boolean(booking.paid),
    validUntil: booking.validUntil
      ? new Date(booking.validUntil).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--',
  }));

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadAppData = async () => {
      const storedUser = localStorage.getItem('parkease_user');
      if (storedUser && mounted) {
        setUser(JSON.parse(storedUser));
      }

      try {
        const [slotsData, bookingsData] = await Promise.all([
          fetchParkingSlots(),
          fetchParkingBookings(),
        ]);

        if (!mounted) return;

        const normalizedSlots = normalizeSlots(slotsData);
        const normalizedBookings = normalizeBookings(bookingsData);
        setSlots(normalizedSlots);
        setBookings(normalizedBookings);
        localStorage.setItem('parkease_slots', JSON.stringify(normalizedSlots));
        localStorage.setItem('parkease_bookings', JSON.stringify(normalizedBookings));
      } catch {
        const storedBookings = localStorage.getItem('parkease_bookings');
        const storedSlots = localStorage.getItem('parkease_slots');

        if (!mounted) return;

        if (storedBookings) {
          setBookings(JSON.parse(storedBookings));
        }
        if (storedSlots) {
          setSlots(normalizeSlots(JSON.parse(storedSlots)));
        } else {
          setSlots(DEFAULT_SLOTS);
          localStorage.setItem('parkease_slots', JSON.stringify(DEFAULT_SLOTS));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAppData();
    return () => {
      mounted = false;
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('parkease_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parkease_user');
  };

  const createBooking = async (booking) => {
    try {
      const savedBooking = await createParkingBooking({
        user: booking.user,
        userEmail: booking.userEmail,
        slot: booking.slot,
        slotId: booking.slotId,
        duration: booking.duration,
        amount: booking.amount,
        pricePerHour: booking.pricePerHour,
      });

      const normalizedBooking = normalizeBookings([savedBooking])[0];
      const nextBookings = [...bookings, normalizedBooking];
      const nextSlots = slots.map((slot) =>
        slot.id === booking.slotId ? { ...slot, status: 'occupied' } : slot
      );

      setBookings(nextBookings);
      setSlots(nextSlots);
      localStorage.setItem('parkease_bookings', JSON.stringify(nextBookings));
      localStorage.setItem('parkease_slots', JSON.stringify(nextSlots));
      return normalizedBooking;
    } catch {
      const fallbackBooking = {
        ...booking,
        id: Date.now(),
        paid: false,
      };
      const nextBookings = [...bookings, fallbackBooking];
      setBookings(nextBookings);
      localStorage.setItem('parkease_bookings', JSON.stringify(nextBookings));
      return fallbackBooking;
    }
  };

  const updateBooking = async (bookingId, updates) => {
    try {
      let normalizedBooking = null;
      if (updates.paid) {
        const savedBooking = await markParkingBookingPaid(bookingId, updates.paymentMethod || 'upi');
        normalizedBooking = normalizeBookings([savedBooking])[0];
      }

      const nextBookings = bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, ...updates, ...normalizedBooking } : booking
      );
      setBookings(nextBookings);
      localStorage.setItem('parkease_bookings', JSON.stringify(nextBookings));
      return nextBookings.find((booking) => booking.id === bookingId) || null;
    } catch {
      const nextBookings = bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, ...updates } : booking
      );
      setBookings(nextBookings);
      localStorage.setItem('parkease_bookings', JSON.stringify(nextBookings));
      return nextBookings.find((booking) => booking.id === bookingId) || null;
    }
  };

  const getBooking = (bookingId) => bookings.find((booking) => booking.id === parseInt(bookingId, 10));

  const updateSlot = (slotId, updates) => {
    const updatedSlots = slots.map((slot) =>
      slot.id === slotId
        ? {
            ...slot,
            ...updates,
            pricePerHour:
              updates.pricePerHour !== undefined
                ? Number(updates.pricePerHour) || 0
                : Number(slot.pricePerHour) || 0,
          }
        : slot
    );
    setSlots(updatedSlots);
    localStorage.setItem('parkease_slots', JSON.stringify(updatedSlots));
  };

  const createSlot = (newSlot) => {
    const slotToCreate = {
      ...newSlot,
      id: Date.now(),
      status: newSlot.status || 'available',
      floor: newSlot.floor || 'Ground',
      pricePerHour: Number(newSlot.pricePerHour) || 75,
    };
    const updatedSlots = [...slots, slotToCreate];
    setSlots(updatedSlots);
    localStorage.setItem('parkease_slots', JSON.stringify(updatedSlots));
  };

  const value = {
    user,
    login,
    logout,
    bookings,
    createBooking,
    updateBooking,
    getBooking,
    slots,
    updateSlot,
    createSlot,
    loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
