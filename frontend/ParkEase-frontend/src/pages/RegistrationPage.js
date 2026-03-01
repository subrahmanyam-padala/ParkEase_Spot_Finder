 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RegistrationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: ""
  });
  
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 🔹 Send OTP
  const handleSendOtp = async () => {
    if (!formData.email) {
      setIsSuccess(false);
      setMessage("Please enter email first");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/send-otp",
        { email: formData.email }
      );

      setIsSuccess(true);
      setMessage(response.data.message);
      setOtpSent(true);
    } catch (error) {
      setIsSuccess(false);
      setMessage("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Register User
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      setIsSuccess(false);
      setMessage("Please verify your email with OTP first");
      return;
    }

    if (!formData.username) {
      setIsSuccess(false);
      setMessage("Username is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setIsSuccess(false);
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        {
          fullName: formData.fullName,
          username: formData.username,
          password: formData.password,
          email: formData.email,
          otp: formData.otp
        }
      );

      setIsSuccess(true);
      setMessage(response.data.message);

      // Save JWT Token
      localStorage.setItem("token", response.data.token);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      setIsSuccess(false);

      if (error.response && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create Account</h2>

        {message && (
          <p className={`auth-message ${isSuccess ? "success" : "error"}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="fullName"
            className="form-control"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          {/* ✅ NEW USERNAME FIELD */}
          <input
            type="text"
            name="username"
            className="form-control"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <div className="otp-row">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="otp-btn"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>

          {otpSent && (
            <input
              type="text"
              name="otp"
              className="form-control"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            className="form-control"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default RegistrationPage;