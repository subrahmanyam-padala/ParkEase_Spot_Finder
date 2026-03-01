 import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import carImage from "../images/image.png";   // ✅ Local image import
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login({
        id: 1,
        name: "John Doe",
        email: formData.email,
      });
      navigate("/dashboard");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center">
      <div className="login-container shadow-lg">
        <div className="row g-0 h-100">

          {/* LEFT IMAGE SECTION */}
          <div
            className="col-md-6 d-none d-md-block image-section"
            style={{ backgroundImage: `url(${carImage})` }}
          ></div>

          {/* RIGHT FORM SECTION */}
          <div className="col-md-6 form-section d-flex align-items-center">
            <div className="w-100 px-5">

              <h2 className="fw-bold mb-2">Sign In to your account</h2>

              <form onSubmit={handleSubmit}>

                {/* Email */}
                 <div className="mb-3">
                  <input
                    type="email"
                    className="form-control custom-input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Password */}
                <div className="mb-3 position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control custom-input"
                    placeholder="Your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                  <i
                    className={`bi ${
                      showPassword ? "bi-eye-slash" : "bi-eye"
                    } input-icon-right`}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>

                {/* Remember + Forgot */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label">
                      Remember me
                    </label>
                  </div>

                  <button
                    type="button"
                    className="btn btn-link p-0 forgot-link"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="btn login-btn w-100"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                {/* Divider */}
                <div className="divider my-4 text-center">
                  <span>Or</span>
                </div>

                {/* Sign Up Section */}
                <div className="text-center">
                  <p className="mb-2 text-muted">
                    Don’t have an account?
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 signup-btn"
                    onClick={() => navigate("/register")}
                  >
                    Create Account
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;