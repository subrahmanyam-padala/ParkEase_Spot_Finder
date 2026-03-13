import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const BottomNav = () => {
  const { user } = useApp();

  if (!user) return null;

  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
        <i className="bi bi-house-fill"></i>
        <span>Home</span>
      </NavLink>
      <NavLink to="/book" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
        <i className="bi bi-geo-alt-fill"></i>
        <span>Book</span>
      </NavLink>
      <NavLink to="/my-bookings" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
        <i className="bi bi-clock-history"></i>
        <span>Bookings</span>
      </NavLink>
      <NavLink to="/chatbot" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
        <i className="bi bi-chat-dots-fill"></i>
        <span>ParkBot</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
        <i className="bi bi-person-fill"></i>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
