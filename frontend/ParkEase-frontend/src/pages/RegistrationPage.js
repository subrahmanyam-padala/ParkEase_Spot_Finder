 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useApp } from "../context/AppContext";
import carImage from "../images/image2.avif";
import "./LoginPage.css"; // reuse same CSS
import { BASE_URL } from "../config";

function RegistrationPage() {
  const navigate = useNavigate();
  const { login } = useApp();

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

  const handleSendOtp = async () => {
    if (!formData.email) {
      setIsSuccess(false);
      setMessage("Please enter email first");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${BASE_URL}/api/auth/send-otp`,
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

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      setIsSuccess(false);
      setMessage("Please verify your email with OTP first");
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
        `${BASE_URL}/api/auth/register`,
        formData
      );

      setIsSuccess(true);
      setMessage(response.data.message);

      localStorage.setItem("parkease_token", response.data.token);
      login({
        name: formData.fullName,
        username: formData.username,
        email: formData.email,
        role: response.data.role || "USER",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center">
      
      {/* MAIN CONTAINER WITH INCREASED HEIGHT */}
      <div
        className="login-container shadow-lg"
        style={{ minHeight: "750px" }}
      >
        <div className="row g-0 h-100">

          {/* LEFT IMAGE SECTION */}
          <div
            className="col-md-6 d-none d-md-block"
            style={{
              minHeight: "750px",
              overflow: "hidden",
              borderTopLeftRadius: "20px",
              borderBottomLeftRadius: "20px"
            }}
          >
            <img
              src={carImage}
              alt="Car"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              }}
            />
          </div>

          {/* RIGHT FORM SECTION */}
          <div className="col-md-6 form-section d-flex align-items-center">
            <div className="w-100 px-5">

              <h2 className="fw-bold mb-2">Create Account</h2>
              <p className="text-muted mb-4">
                Register to get started
              </p>

              {message && (
                <div className={`alert ${isSuccess ? "alert-success" : "alert-danger"}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleRegister}>

                <input
                  type="text"
                  name="fullName"
                  className="form-control custom-input mb-3"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="username"
                  className="form-control custom-input mb-3"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />

                {/* Email + OTP Button */}
                <div className="d-flex mb-3">
                  <input
                    type="email"
                    name="email"
                    className="form-control custom-input me-2"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="btn btn-outline-primary"
                    style={{ minWidth: "120px" }}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>

                {otpSent && (
                  <input
                    type="text"
                    name="otp"
                    className="form-control custom-input mb-3"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                  />
                )}

                <input
                  type="password"
                  name="password"
                  className="form-control custom-input mb-3"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control custom-input mb-4"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="submit"
                  className="btn login-btn w-100"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </button>

              </form>

              <div className="text-center mt-4">
                <p className="mb-2 text-muted">
                  Already have an account?
                </p>
                <button
                  className="btn btn-outline-primary w-100 signup-btn"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;
