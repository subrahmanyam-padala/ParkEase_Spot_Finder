import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  const [method, setMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [upi, setUpi] = useState("");

  if (!data) return <h2>No payment data</h2>;

  const handlePay = () => {
    if (method === "card") {
      if (cardNumber.length !== 16 || cvv.length !== 3) {
        alert("Invalid Card Details");
        return;
      }
    }

    if (method === "upi") {
      if (!upi.includes("@")) {
        alert("Invalid UPI ID");
        return;
      }
    }

    navigate("/success");
  };

  return (
    <div className="payment-bg">
      <div className="glass-card">
        <h2>💳 Secure Payment</h2>

        <div className="payment-methods">
          <button
            className={method === "card" ? "active-method" : ""}
            onClick={() => setMethod("card")}
          >
            Card
          </button>

          <button
            className={method === "upi" ? "active-method" : ""}
            onClick={() => setMethod("upi")}
          >
            UPI
          </button>
        </div>

        {method === "card" && (
          <>
            <input
              type="text"
              placeholder="Card Number (16 digits)"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <input
              type="text"
              placeholder="CVV (3 digits)"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </>
        )}

        {method === "upi" && (
          <input
            type="text"
            placeholder="Enter UPI ID (example@upi)"
            value={upi}
            onChange={(e) => setUpi(e.target.value)}
          />
        )}

        <h3>Amount: ₹{data.amount}</h3>

        <button className="primary-btn" onClick={handlePay}>
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
