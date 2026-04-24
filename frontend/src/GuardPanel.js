import React, { useState } from "react";

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function GuardPanel() {
  const [loading, setLoading] = useState({
    carEntry: false,
    carExit: false,
    bikeEntry: false,
    bikeExit: false,
  });
  const [message, setMessage] = useState("");

  const handleAction = async (action, endpoint) => {
    setLoading((prev) => ({ ...prev, [action]: true }));
    setMessage("");

    try {
      const response = await axios.post(`${API_URL}/parking/${endpoint}`);
      setMessage(`✅ ${response.data.message}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Operation failed";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoading((prev) => ({ ...prev, [action]: false }));
    }
  };

  const carEntry = () => handleAction("carEntry", "car-entry");
  const carExit = () => handleAction("carExit", "car-exit");
  const bikeEntry = () => handleAction("bikeEntry", "bike-entry");
  const bikeExit = () => handleAction("bikeExit", "bike-exit");

  return (
    <div>
      <h2>Guard Control Panel</h2>

      {message && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "8px",
            background: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
            color: message.startsWith("✅") ? "#155724" : "#721c24",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}

      <div className="control-section">
        <h3>🚗 Car Parking</h3>
        <div className="button-group">
          <button
            className="guard-button entry-button"
            onClick={carEntry}
            disabled={loading.carEntry}
          >
            {loading.carEntry ? "Processing..." : "Entry"}
          </button>
          <button
            className="guard-button exit-button"
            onClick={carExit}
            disabled={loading.carExit}
          >
            {loading.carExit ? "Processing..." : "Exit"}
          </button>
        </div>
      </div>

      <div className="control-section">
        <h3>🏍️ Bike Parking</h3>
        <div className="button-group">
          <button
            className="guard-button entry-button"
            onClick={bikeEntry}
            disabled={loading.bikeEntry}
          >
            {loading.bikeEntry ? "Processing..." : "Entry"}
          </button>
          <button
            className="guard-button exit-button"
            onClick={bikeExit}
            disabled={loading.bikeExit}
          >
            {loading.bikeExit ? "Processing..." : "Exit"}
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          background: "#f8f9fa",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#666",
        }}
      >
        <strong>Instructions:</strong>
        <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
          <li>Click "Entry" when a vehicle enters</li>
          <li>Click "Exit" when a vehicle leaves</li>
          <li>Dashboard updates automatically</li>
        </ul>
      </div>
    </div>
  );
}

export default GuardPanel;
