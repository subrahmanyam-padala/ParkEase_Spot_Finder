 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import parkingBg from "../images/image3.jpg";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("user");

  const [formData, setFormData] = useState({
    email: "",
    adminId: "",
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
    if (accountType === "admin") {
      setIsSuccess(false);
      setMessage("Admin reset does not require OTP. Enter Admin ID and new password.");
      return;
    }

    if (!formData.email) {
      setIsSuccess(false);
      setMessage("Please enter email first");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `http://${window.location.hostname}:8080/api/auth/send-otp`,
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

    if (accountType === "user" && !otpSent) {
      setIsSuccess(false);
      setMessage("Please verify your email with OTP first");
      return;
    }

    if (accountType === "admin" && !formData.adminId.trim()) {
      setIsSuccess(false);
      setMessage("Please enter Admin ID");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setIsSuccess(false);
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const endpoint = accountType === "admin"
        ? `http://${window.location.hostname}:8080/api/admin/auth/reset-password`
        : `http://${window.location.hostname}:8080/api/auth/reset-password`;

      const payload = accountType === "admin"
        ? {
            email: formData.email,
            adminId: formData.adminId,
            password: formData.password,
          }
        : {
            email: formData.email,
            otp: formData.otp,
            password: formData.password,
          };

      const response = await axios.post(endpoint, payload);

      setIsSuccess(true);
      setMessage(response.data.message);

      setTimeout(() => navigate(accountType === "admin" ? "/admin/login" : "/login"), 1000);

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

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button
              type="button"
              onClick={() => {
                setAccountType("user");
                setOtpSent(false);
                setMessage("");
              }}
              style={{
                ...toggleButtonStyle,
                background: accountType === "user" ? "#20c997" : "rgba(255,255,255,0.15)",
              }}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType("admin");
                setOtpSent(false);
                setMessage("");
              }}
              style={{
                ...toggleButtonStyle,
                background: accountType === "admin" ? "#20c997" : "rgba(255,255,255,0.15)",
              }}
            >
              Admin
            </button>
          </div>

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

              {accountType === "user" && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  style={otpButtonStyle}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              )}
            </div>

            {accountType === "admin" && (
              <input
                type="text"
                name="adminId"
                placeholder="Admin ID"
                value={formData.adminId}
                onChange={handleChange}
                required
                style={{ ...inputStyle, marginBottom: "15px" }}
              />
            )}

            {accountType === "user" && otpSent && (
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
              onClick={() => navigate(accountType === "admin" ? "/admin/login" : "/login")}
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

const toggleButtonStyle = {
  flex: 1,
  border: "none",
  borderRadius: "10px",
  color: "#fff",
  fontWeight: "600",
  padding: "10px 12px",
  cursor: "pointer",
};

export default ForgotPasswordPage;