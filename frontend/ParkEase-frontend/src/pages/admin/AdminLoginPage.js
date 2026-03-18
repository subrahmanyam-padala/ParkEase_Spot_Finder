import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLoginPage.css';
import { setAdminSession } from '../../utils/adminAuth';
import { adminLogin } from '../../utils/adminApi';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrId: '',
    password: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await adminLogin(formData);
      setAdminSession(response);
      navigate('/admin/dashboard');
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to sign in as admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <h2 className="admin-title">Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter admin email or admin ID"
              value={formData.emailOrId}
              onChange={(event) =>
                setFormData({ ...formData, emailOrId: event.target.value })
              }
              required
            />
          </div>

          <div className="form-group password-group">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={formData.password}
              onChange={(event) =>
                setFormData({ ...formData, password: event.target.value })
              }
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" /> Remember me
            </label>

            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
