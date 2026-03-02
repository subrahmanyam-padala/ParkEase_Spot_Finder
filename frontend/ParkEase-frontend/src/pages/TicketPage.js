import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const TicketPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state;

  if (!booking) {
    return (
      <div className="container py-5">
        <h4>No ticket data found.</h4>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/")}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="card shadow p-4 text-center">
          <h2 className="text-success mb-3">Payment Successful 🎉</h2>
          <h4>Your Parking Slot is Confirmed</h4>

          <hr />

          <p><strong>Booking ID:</strong> {booking.bookingId}</p>
          <p><strong>Location:</strong> {booking.location}</p>
          <p><strong>Date:</strong> {booking.date}</p>
          <p><strong>Time:</strong> {booking.time}</p>
          <p><strong>Vehicle Number:</strong> {booking.vehicleNumber}</p>
          <p><strong>Total Paid:</strong> ₹{booking.finalAmount || booking.amount}</p>

          <button
            className="btn btn-dark mt-3"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TicketPage;
