import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer, ErrorAlert } from '../components';
import { loginUser } from '../utils/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useApp();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser(formData.username, formData.password);
      const { token, username, role, message, fullName, email, userId } = res.data;

      if (token) {
        localStorage.setItem('parkease_token', token);
        login({
          name: fullName || username,
          fullName: fullName || username,
          username: username,
          email: email || '',
          userId: userId,
          role: role,
        });
        navigate('/dashboard');
      } else {
        setError(message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#ECF0F1' }}>
      <Navbar />

      <div className="flex-grow-1 d-flex align-items-center py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5">
              <div className="card fade-in">
                <div className="card-header text-center">
                  <h4 className="mb-1">
                    <i className="bi bi-person-circle me-2"></i>
                    Welcome Back
                  </h4>
                  <p style={{ color: 'white' }}>Sign in to your ParkEase account</p>
                </div>
                <div className="card-body p-4">
                  {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-person me-1"></i> Username
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-lock me-1"></i> Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Login
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center">
                    <p className="text-muted small mb-2">Don't have an account?</p>
                    <button
                      className="btn btn-outline-primary w-100"
                      onClick={() => navigate('/register')}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Create Account
                    </button>
                  </div>

                  <div className="text-center mt-2">
                    <button
                      className="btn btn-link text-muted small p-0"
                      onClick={() => navigate('/forgot-password')}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <hr className="my-3" />

                  <div className="text-center">
                    <button
                      className="btn btn-outline-dark btn-sm"
                      onClick={() => navigate('/admin/login')}
                    >
                      <i className="bi bi-shield-lock me-1"></i>
                      Admin Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
