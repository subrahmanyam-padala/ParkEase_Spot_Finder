 import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components';

import {
  LandingPage,
  LoginPage,
  DashboardPage,
  BookingPage,
  CheckoutPage,
  PaymentPage,
  TicketPage,
  ActiveTicketTrackingPage,
  AdminAnalyticsPage,
  NotFoundPage,
} from './pages';

import RegistrationPage from "./pages/RegistrationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

/* ================= ADMIN ================= */
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSlotsPage from './pages/admin/AdminSlotsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminRevenuePage from './pages/admin/AdminRevenuePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAdminUsersPage from './pages/admin/AdminAdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAlertsPage from './pages/admin/AdminAlertsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import AdminForgotPasswordPage from './pages/admin/AdminForgotPasswordPage';

function App() {
  return (
    <AppProvider>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ================= ADMIN AUTH PAGES (Standalone) ================= */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
        {/* ================= ADMIN DASHBOARD (Protected + Layout) ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="slots" element={<AdminSlotsPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="revenue" element={<AdminRevenuePage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="admin-users" element={<AdminAdminUsersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="alerts" element={<AdminAlertsPage />} />
        </Route>

        {/* ================= USER PROTECTED ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticket/:bookingId"
          element={
            <ProtectedRoute>
              <TicketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/active-ticket"
          element={
            <ProtectedRoute>
              <ActiveTicketTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AdminAnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </AppProvider>
  );
}

export default App;
