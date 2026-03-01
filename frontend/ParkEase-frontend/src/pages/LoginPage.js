 import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar, Footer, ErrorAlert } from '../components';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useApp();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulated login (replace later with real API)
    setTimeout(() => {
      if (formData.email && formData.password) {
        login({
          id: 1,
          name: 'John Doe',
          email: formData.email,
          phone: '+91 98765 43210',
        });

        navigate('/dashboard');
      } else {
        setError('Please enter valid credentials');
      }

      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ backgroundColor: '#ECF0F1' }}
    >
      <Navbar />

      <div className="flex-grow-1 d-flex align-items-center py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5">
              <div className="card fade-in">
                <div className="card-header text-center">
                  <h4 className="mb-0">
                    <i className="bi bi-person-circle me-2"></i>
                    Welcome Back
                  </h4>
                </div>

                <div className="card-body p-4">
                  {error && (
                    <ErrorAlert
                      message={error}
                      onDismiss={() => setError('')}
                    />
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-envelope me-1"></i>
                        Email Address
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-lock me-1"></i>
                        Password
                      </label>

                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
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

                  {/* Forgot password link */}
                        <div className="text-end mb-3">
                    <button
                      className="btn btn-link p-0"
                      onClick={() => navigate('/forgot-password')}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Create Account Button */}
                  <div className="text-center">
                    <p className="text-muted small mb-2">
                      Don't have an account?
                    </p>

                    {/* OPTION 1: Using navigate */}
                    <button
                      className="btn btn-outline-primary w-100"
                      onClick={() => navigate('/register')}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Create Account
                    </button>

                    {/* OPTION 2 (Alternative way using Link)
                    <Link to="/register" className="btn btn-outline-primary w-100">
                      <i className="bi bi-person-plus me-2"></i>
                      Create Account
                    </Link>
                    */}
                  </div>

                  {/* Demo Credentials */}
                  <div
                    className="mt-4 p-3 rounded"
                    style={{ backgroundColor: '#ECF0F1' }}
                  >
                    <p className="small mb-2 fw-semibold text-center">
                      <i className="bi bi-info-circle me-1"></i>
                      Demo Credentials
                    </p>

                    <p className="small mb-0 text-center text-muted">
                      Email: demo@parkease.com
                      <br />
                      Password: any password
                    </p>
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