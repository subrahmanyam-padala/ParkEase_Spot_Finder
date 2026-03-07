import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) return <h2>No booking data</h2>;

  return (
    <div className="checkout-bg">
      <div className="summary-card">
        <h2>Booking Summary</h2>

        <p><strong>Slot:</strong> {data.selectedSlot}</p>
        <p><strong>Vehicle:</strong> {data.vehicleNumber}</p>
        <p><strong>Duration:</strong> {data.duration} hrs</p>

        <hr />

        <h3>Total: ₹{data.amount}</h3>

        <button
          className="primary-btn"
          onClick={() => navigate("/payment", { state: data })}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
