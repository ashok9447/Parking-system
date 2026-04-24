const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const { runMigrations, pool } = require("./migrate");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Run migrations on startup
runMigrations()
  .then(() => {
    console.log("✅ Database ready");
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });

// Get parking status
app.get("/parking/status", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM parking_status ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching parking status:", error);
    res.status(500).json({ error: "Failed to fetch parking status" });
  }
});

// Car entry
app.post("/parking/car-entry", async (req, res) => {
  try {
    // Check if slots are available
    const checkResult = await pool.query(
      "SELECT total_slots, occupied_slots FROM parking_status WHERE vehicle_type='car'",
    );

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Car parking configuration not found" });
    }

    const { total_slots, occupied_slots } = checkResult.rows[0];

    if (occupied_slots >= total_slots) {
      return res
        .status(400)
        .json({ error: "No available parking slots for cars" });
    }

    await pool.query(
      "UPDATE parking_status SET occupied_slots = occupied_slots + 1 WHERE vehicle_type='car'",
    );

    io.emit("parkingUpdated");
    res.json({ message: "Car entry recorded successfully" });
  } catch (error) {
    console.error("Error recording car entry:", error);
    res.status(500).json({ error: "Failed to record car entry" });
  }
});

// Car exit
app.post("/parking/car-exit", async (req, res) => {
  try {
    // Check if there are occupied slots
    const checkResult = await pool.query(
      "SELECT occupied_slots FROM parking_status WHERE vehicle_type='car'",
    );

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Car parking configuration not found" });
    }

    const { occupied_slots } = checkResult.rows[0];

    if (occupied_slots <= 0) {
      return res.status(400).json({ error: "No cars currently parked" });
    }

    await pool.query(
      "UPDATE parking_status SET occupied_slots = occupied_slots - 1 WHERE vehicle_type='car'",
    );

    io.emit("parkingUpdated");
    res.json({ message: "Car exit recorded successfully" });
  } catch (error) {
    console.error("Error recording car exit:", error);
    res.status(500).json({ error: "Failed to record car exit" });
  }
});

// Bike entry
app.post("/parking/bike-entry", async (req, res) => {
  try {
    // Check if slots are available
    const checkResult = await pool.query(
      "SELECT total_slots, occupied_slots FROM parking_status WHERE vehicle_type='bike'",
    );

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Bike parking configuration not found" });
    }

    const { total_slots, occupied_slots } = checkResult.rows[0];

    if (occupied_slots >= total_slots) {
      return res
        .status(400)
        .json({ error: "No available parking slots for bikes" });
    }

    await pool.query(
      "UPDATE parking_status SET occupied_slots = occupied_slots + 1 WHERE vehicle_type='bike'",
    );

    io.emit("parkingUpdated");
    res.json({ message: "Bike entry recorded successfully" });
  } catch (error) {
    console.error("Error recording bike entry:", error);
    res.status(500).json({ error: "Failed to record bike entry" });
  }
});

// Bike exit
app.post("/parking/bike-exit", async (req, res) => {
  try {
    // Check if there are occupied slots
    const checkResult = await pool.query(
      "SELECT occupied_slots FROM parking_status WHERE vehicle_type='bike'",
    );

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Bike parking configuration not found" });
    }

    const { occupied_slots } = checkResult.rows[0];

    if (occupied_slots <= 0) {
      return res.status(400).json({ error: "No bikes currently parked" });
    }

    await pool.query(
      "UPDATE parking_status SET occupied_slots = occupied_slots - 1 WHERE vehicle_type='bike'",
    );

    io.emit("parkingUpdated");
    res.json({ message: "Bike exit recorded successfully" });
  } catch (error) {
    console.error("Error recording bike exit:", error);
    res.status(500).json({ error: "Failed to record bike exit" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
