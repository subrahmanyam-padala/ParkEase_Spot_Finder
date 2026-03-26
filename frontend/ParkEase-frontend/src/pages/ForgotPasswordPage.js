 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import parkingBg from "../images/image3.jpg";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: ""
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
      const response = await apiClient.post(
        "/api/auth/send-otp",
        { email: formData.email }
      );

      setIsSuccess(true);
      setMessage(response.data.message);
      setOtpSent(true);
    } catch {
      setIsSuccess(false);
      setMessage("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
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

      const response = await apiClient.post(
        "/api/auth/reset-password",
        {
          email: formData.email,
          otp: formData.otp,
          password: formData.password
        }
      );

      setIsSuccess(true);
      setMessage(response.data.message);

      setTimeout(() => navigate("/login"), 1000);

    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message ||
        "Password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f8",
        padding: "20px"
      }}
    >
      {/* Card with Background Image */}
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "20px",
          padding: "40px 30px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
          backgroundImage: `url(${parkingBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Dark Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)"
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, color: "#fff" }}>
          <h2 style={{ textAlign: "center", marginBottom: "25px", fontWeight: "700" }}>
            Reset Password
          </h2>

          {message && (
            <div
              style={{
                background: isSuccess ? "#28a745" : "#dc3545",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "15px",
                fontSize: "14px",
                textAlign: "center"
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleReset}>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                style={otpButtonStyle}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>

            {otpSent && (
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                required
                style={{ ...inputStyle, marginBottom: "15px" }}
              />
            )}

            <input
              type="password"
              name="password"
              placeholder="New Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ ...inputStyle, marginBottom: "15px" }}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{ ...inputStyle, marginBottom: "20px" }}
            />

            <button
              type="submit"
              disabled={loading}
              style={mainButtonStyle}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
            Remembered your password?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ color: "#fff", fontWeight: "600", cursor: "pointer" }}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  flex: 1,
  height: "45px",
  borderRadius: "10px",
  border: "none",
  padding: "0 15px",
  outline: "none"
};

const otpButtonStyle = {
  background: "#20c997",
  border: "none",
  borderRadius: "10px",
  padding: "0 15px",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer"
};

const mainButtonStyle = {
  width: "100%",
  height: "48px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg, #5f2eea, #7b61ff)",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer"
};

export default ForgotPasswordPage;
