import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the App Context
const AppContext = createContext();

// Custom hook to use the App Context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// App Provider Component
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user and bookings from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('parkease_user');
    const storedBookings = localStorage.getItem('parkease_bookings');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }

    setLoading(false);
  }, []);

  // Login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('parkease_user', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('parkease_user');
  };

  // Create a new booking
  const createBooking = (booking) => {
    const updatedBookings = [...bookings, booking];
    setBookings(updatedBookings);
    localStorage.setItem('parkease_bookings', JSON.stringify(updatedBookings));
  };

  // Update an existing booking
  const updateBooking = (bookingId, updates) => {
    const updatedBookings = bookings.map((b) =>
      b.id === bookingId ? { ...b, ...updates } : b
    );
    setBookings(updatedBookings);
    localStorage.setItem('parkease_bookings', JSON.stringify(updatedBookings));
  };

  // Get a specific booking by ID
  const getBooking = (bookingId) => {
    return bookings.find((b) => b.id === parseInt(bookingId));
  };

  // Context value
  const value = {
    user,
    login,
    logout,
    bookings,
    createBooking,
    updateBooking,
    getBooking,
    loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
