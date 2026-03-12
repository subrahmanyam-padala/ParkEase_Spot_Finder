import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminRegisterPage.css';
import { adminResetPassword } from '../../utils/adminApi';

const AdminForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    adminId: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      window.alert('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      await adminResetPassword({
        email: formData.email,
        adminId: formData.adminId,
        password: formData.password,
      });
      window.alert('Password reset successful!');
      navigate('/admin/login');
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-wrapper">
      <div className="admin-register-card">
        <h2 className="admin-title">Reset Admin Password</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Registered Email"
              required
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Admin ID"
              required
              onChange={(event) =>
                setFormData({ ...formData, adminId: event.target.value })
              }
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="New Password"
              required
              onChange={(event) =>
                setFormData({ ...formData, password: event.target.value })
              }
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm New Password"
              required
              onChange={(event) =>
                setFormData({ ...formData, confirmPassword: event.target.value })
              }
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>

          <div className="login-link">
            <p>
              Back to{' '}
              <span onClick={() => navigate('/admin/login')}>
                Admin Login
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForgotPasswordPage;
