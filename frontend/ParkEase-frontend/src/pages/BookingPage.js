import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const allSlots = [
  "A1","A2","A3","A4",
  "B1","B2","B3","B4",
  "C1","C2","C3","C4",
  "D1","D2","D3","D4"
];

const BookingPage = () => {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [duration, setDuration] = useState(1);
  const [bookedSlots, setBookedSlots] = useState([]);

  // randomly mark some slots as unavailable
  useEffect(() => {
    const randomBooked = allSlots.filter(() => Math.random() < 0.3);
    setBookedSlots(randomBooked);
  }, []);

  const amount = duration * 50;

  const handleCheckout = () => {
    if (!selectedSlot || !vehicleNumber) {
      alert("Please complete all details");
      return;
    }

    navigate("/checkout", {
      state: { selectedSlot, vehicleNumber, duration, amount }
    });
  };

  return (
    <div className="booking-bg">
      <div className="glass-card">
        <h2>🚗 Select Your Slot</h2>

        {/* Legend */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ color: "#00ff88", marginRight: "15px" }}>
            ● Available
          </span>
          <span style={{ color: "#ff4d4d" }}>
            ● Booked
          </span>
        </div>

        <div className="slot-grid">
          {allSlots.map((slot) => {
            const isBooked = bookedSlots.includes(slot);
            const isSelected = selectedSlot === slot;

            return (
              <div
                key={slot}
                className={`slot-card
                  ${isBooked ? "booked-slot" : ""}
                  ${isSelected ? "selected-slot" : ""}`}
                onClick={() => !isBooked && setSelectedSlot(slot)}
              >
                {slot}
              </div>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Enter Vehicle Number"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
        />

        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          <option value={1}>1 Hour</option>
          <option value={2}>2 Hours</option>
          <option value={3}>3 Hours</option>
        </select>

        <h3>Total: ₹{amount}</h3>

        <button className="primary-btn" onClick={handleCheckout}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
