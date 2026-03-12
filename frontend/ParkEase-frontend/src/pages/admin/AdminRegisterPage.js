import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminRegisterPage.css';
import { adminRegister } from '../../utils/adminApi';
import { setAdminSession } from '../../utils/adminAuth';

const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
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
      const response = await adminRegister({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        adminId: formData.adminId,
        password: formData.password,
      });
      setAdminSession(response);
      window.alert('Admin registered successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to register admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-wrapper">
      <div className="admin-register-card">
        <h2 className="admin-title">Create Admin Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Full Name"
              required
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              required
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
            />
          </div>

          <div className="form-group">
            <input
              type="tel"
              placeholder="Mobile Number"
              required
              onChange={(event) =>
                setFormData({ ...formData, mobile: event.target.value })
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
              placeholder="Password"
              required
              onChange={(event) =>
                setFormData({ ...formData, password: event.target.value })
              }
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              required
              onChange={(event) =>
                setFormData({ ...formData, confirmPassword: event.target.value })
              }
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register Admin'}
          </button>

          <div className="login-link">
            <p>
              Already have an account?{' '}
              <span onClick={() => navigate('/admin/login')}>
                Login Here
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegisterPage;
