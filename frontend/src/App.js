import "./App.css";

import React, { useEffect, useState } from "react";

import GuardPanel from "./GuardPanel";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const socket = io(API_URL);

function App() {
  const [parking, setParking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchParking = async () => {
    try {
      setError(null);
      const res = await axios.get(`${API_URL}/parking/status`);
      setParking(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching parking data:", err);
      setError(
        "Failed to fetch parking data. Please check if the server is running.",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParking();

    socket.on("parkingUpdated", () => {
      fetchParking();
    });

    socket.on("connect_error", () => {
      setError("Connection to server lost. Trying to reconnect...");
    });

    socket.on("connect", () => {
      setError(null);
      fetchParking();
    });

    return () => {
      socket.off("parkingUpdated");
      socket.off("connect_error");
      socket.off("connect");
    };
  }, []);

  const getVehicleIcon = (type) => {
    return type === "car" ? "🚗" : "🏍️";
  };

  const getStatusInfo = (available, total) => {
    const percentage = ((total - available) / total) * 100;

    if (available === 0) {
      return { text: "🔴 FULL", class: "status-full" };
    } else if (percentage > 80) {
      return { text: "⚠️ Limited", class: "status-limited" };
    } else {
      return { text: "🟢 Available", class: "status-available" };
    }
  };

  const getProgressClass = (percentage) => {
    if (percentage < 50) return "progress-low";
    if (percentage < 80) return "progress-medium";
    return "progress-high";
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading parking information...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* LEFT SIDE - GUARD PANEL */}
      <div className="guard-panel">
        <GuardPanel />
      </div>

      {/* RIGHT SIDE - DASHBOARD */}
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>🏢 Lulu Cyber Tower 2</h1>
          <p>Real-time Parking Availability</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="parking-cards">
          {parking.map((p) => {
            const available = p.total_slots - p.occupied_slots;
            const percentage = (p.occupied_slots / p.total_slots) * 100;
            const statusInfo = getStatusInfo(available, p.total_slots);

            return (
              <div key={p.id} className="parking-card">
                <div className="card-header">
                  <span className="vehicle-icon">
                    {getVehicleIcon(p.vehicle_type)}
                  </span>
                  <h2>{p.vehicle_type.toUpperCase()}</h2>
                </div>

                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Total</div>
                    <div className="stat-value">{p.total_slots}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Occupied</div>
                    <div className="stat-value">{p.occupied_slots}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Available</div>
                    <div
                      className="stat-value"
                      style={{ color: available > 0 ? "#28a745" : "#dc3545" }}
                    >
                      {available}
                    </div>
                  </div>
                </div>

                <div className={`status-indicator ${statusInfo.class}`}>
                  {statusInfo.text}
                </div>

                <div className="progress-bar-container">
                  <div
                    className={`progress-bar ${getProgressClass(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
