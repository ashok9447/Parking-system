-- Database initialization script for Lulu Cyber Tower 2 Parking System
-- This script creates the necessary tables and initial data

-- Drop existing table if it exists
DROP TABLE IF EXISTS parking_status;

-- Create parking_status table
CREATE TABLE parking_status (
    id SERIAL PRIMARY KEY,
    vehicle_type VARCHAR(20) NOT NULL UNIQUE,
    total_slots INTEGER NOT NULL CHECK (total_slots >= 0),
    occupied_slots INTEGER NOT NULL DEFAULT 0 CHECK (occupied_slots >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial parking configuration for Lulu Cyber Tower 2
INSERT INTO parking_status (vehicle_type, total_slots, occupied_slots) VALUES
    ('bike', 300, 0),
    ('car', 200, 0);

-- Create index for faster queries
CREATE INDEX idx_vehicle_type ON parking_status(vehicle_type);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_parking_status_updated_at 
    BEFORE UPDATE ON parking_status 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Display current parking status
SELECT * FROM parking_status;

-- Made with Bob
