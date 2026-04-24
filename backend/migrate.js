const { Pool } = require("pg");

// Parse DATABASE_URL if provided (for Render/Heroku deployment)
let dbConfig;
if (process.env.DATABASE_URL) {
  const { parse } = require("pg-connection-string");
  dbConfig = parse(process.env.DATABASE_URL);
  dbConfig.ssl = { rejectUnauthorized: false };
} else {
  dbConfig = {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "ashokr",
    password: process.env.DB_PASSWORD || "",
    port: process.env.DB_PORT || 5433,
  };
}

const pool = new Pool(dbConfig);

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log("🔄 Running database migrations...");

    // Create parking_status table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS parking_status (
        id SERIAL PRIMARY KEY,
        vehicle_type VARCHAR(20) NOT NULL UNIQUE,
        total_slots INTEGER NOT NULL CHECK (total_slots >= 0),
        occupied_slots INTEGER NOT NULL DEFAULT 0 CHECK (occupied_slots >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Table 'parking_status' ready");

    // Check if data exists
    const result = await client.query("SELECT COUNT(*) FROM parking_status");
    const count = parseInt(result.rows[0].count);

    if (count === 0) {
      // Insert initial data
      await client.query(`
        INSERT INTO parking_status (vehicle_type, total_slots, occupied_slots)
        VALUES 
          ('bike', 300, 0),
          ('car', 200, 0);
      `);
      console.log("✅ Initial parking data inserted");
    } else {
      console.log("✅ Parking data already exists");
    }

    // Create index if it doesn't exist
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_vehicle_type ON parking_status(vehicle_type);
    `);
    console.log("✅ Index created");

    // Create update trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger if it doesn't exist
    await client.query(`
      DROP TRIGGER IF EXISTS update_parking_status_updated_at ON parking_status;
      CREATE TRIGGER update_parking_status_updated_at 
        BEFORE UPDATE ON parking_status 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log("✅ Triggers configured");

    console.log("🎉 Database migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { runMigrations, pool };

// Made with Bob
