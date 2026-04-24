# Database Schema Documentation

## Overview

This document describes the database schema for the Lulu Cyber Tower 2 Parking Management System.

## Database Information

- **Database Name**: ashokr
- **Database Type**: PostgreSQL
- **Version**: 12+

## Tables

### parking_status

Stores the current parking status for different vehicle types.

#### Schema

| Column Name    | Data Type   | Constraints                                      | Description                             |
| -------------- | ----------- | ------------------------------------------------ | --------------------------------------- |
| id             | SERIAL      | PRIMARY KEY                                      | Auto-incrementing unique identifier     |
| vehicle_type   | VARCHAR(20) | NOT NULL, UNIQUE                                 | Type of vehicle (e.g., 'car', 'bike')   |
| total_slots    | INTEGER     | NOT NULL, CHECK (total_slots >= 0)               | Total number of parking slots available |
| occupied_slots | INTEGER     | NOT NULL, DEFAULT 0, CHECK (occupied_slots >= 0) | Number of currently occupied slots      |
| created_at     | TIMESTAMP   | DEFAULT CURRENT_TIMESTAMP                        | Record creation timestamp               |
| updated_at     | TIMESTAMP   | DEFAULT CURRENT_TIMESTAMP                        | Last update timestamp                   |

#### Indexes

- **PRIMARY KEY**: `id`
- **UNIQUE INDEX**: `vehicle_type`
- **INDEX**: `idx_vehicle_type` on `vehicle_type` column for faster queries

#### Constraints

1. **total_slots**: Must be >= 0
2. **occupied_slots**: Must be >= 0
3. **vehicle_type**: Must be unique across all records

#### Triggers

**update_parking_status_updated_at**

- **Type**: BEFORE UPDATE
- **Function**: `update_updated_at_column()`
- **Purpose**: Automatically updates the `updated_at` timestamp whenever a record is modified

## Initial Data

The system is initialized with the following default values:

| vehicle_type | total_slots | occupied_slots |
| ------------ | ----------- | -------------- |
| bike         | 300         | 0              |
| car          | 200         | 0              |

## Common Queries

### Get Current Parking Status

```sql
SELECT * FROM parking_status ORDER BY id;
```

**Returns**: All parking records with current occupancy

### Get Available Slots for Cars

```sql
SELECT
    vehicle_type,
    total_slots,
    occupied_slots,
    (total_slots - occupied_slots) AS available_slots
FROM parking_status
WHERE vehicle_type = 'car';
```

### Record Car Entry

```sql
UPDATE parking_status
SET occupied_slots = occupied_slots + 1
WHERE vehicle_type = 'car'
AND occupied_slots < total_slots;
```

**Note**: The application validates this before execution to prevent overfilling.

### Record Car Exit

```sql
UPDATE parking_status
SET occupied_slots = occupied_slots - 1
WHERE vehicle_type = 'car'
AND occupied_slots > 0;
```

**Note**: The application validates this before execution to prevent negative values.

### Get Occupancy Percentage

```sql
SELECT
    vehicle_type,
    total_slots,
    occupied_slots,
    ROUND((occupied_slots::DECIMAL / total_slots * 100), 2) AS occupancy_percentage
FROM parking_status;
```

### Check if Parking is Full

```sql
SELECT
    vehicle_type,
    CASE
        WHEN occupied_slots >= total_slots THEN 'FULL'
        WHEN occupied_slots::DECIMAL / total_slots > 0.8 THEN 'LIMITED'
        ELSE 'AVAILABLE'
    END AS status
FROM parking_status;
```

## Maintenance Queries

### Reset All Parking Slots

```sql
UPDATE parking_status SET occupied_slots = 0;
```

**Use Case**: Reset at the end of the day or for testing

### Update Total Slots

```sql
-- Update car parking capacity
UPDATE parking_status
SET total_slots = 250
WHERE vehicle_type = 'car';

-- Update bike parking capacity
UPDATE parking_status
SET total_slots = 350
WHERE vehicle_type = 'bike';
```

### Add New Vehicle Type

```sql
INSERT INTO parking_status (vehicle_type, total_slots, occupied_slots)
VALUES ('motorcycle', 50, 0);
```

### View Parking History (if audit table exists)

```sql
-- This would require creating an audit table
-- Example structure for future enhancement:
CREATE TABLE parking_audit (
    id SERIAL PRIMARY KEY,
    vehicle_type VARCHAR(20),
    action VARCHAR(10), -- 'ENTRY' or 'EXIT'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    previous_count INTEGER,
    new_count INTEGER
);
```

## Data Integrity

### Validation Rules

1. **Occupied slots cannot exceed total slots**
   - Enforced at application level before database update
   - Prevents overfilling

2. **Occupied slots cannot be negative**
   - Enforced by CHECK constraint
   - Enforced at application level before database update

3. **Total slots must be non-negative**
   - Enforced by CHECK constraint

4. **Vehicle type must be unique**
   - Enforced by UNIQUE constraint

### Error Handling

The application handles the following scenarios:

1. **Parking Full**: Returns error when trying to add entry to full parking
2. **Empty Parking**: Returns error when trying to record exit from empty parking
3. **Invalid Vehicle Type**: Returns 404 if vehicle type doesn't exist
4. **Database Connection Failure**: Returns 500 with appropriate error message

## Backup and Recovery

### Backup Command

```bash
# Full database backup
pg_dump -U postgres -d ashokr > parking_backup_$(date +%Y%m%d).sql

# Table-specific backup
pg_dump -U postgres -d ashokr -t parking_status > parking_status_backup.sql
```

### Restore Command

```bash
# Restore full database
psql -U postgres -d ashokr < parking_backup_20240101.sql

# Restore specific table
psql -U postgres -d ashokr < parking_status_backup.sql
```

## Performance Considerations

1. **Indexes**: The `idx_vehicle_type` index ensures fast lookups by vehicle type
2. **Connection Pooling**: The application uses pg Pool for efficient connection management
3. **Transactions**: All updates are atomic to prevent race conditions

## Security Considerations

1. **SQL Injection Prevention**: All queries use parameterized statements
2. **Access Control**: Database credentials stored in environment variables
3. **Validation**: Input validation at application level before database operations

## Future Enhancements

Potential schema additions for future features:

### Parking History Table

```sql
CREATE TABLE parking_history (
    id SERIAL PRIMARY KEY,
    vehicle_type VARCHAR(20) NOT NULL,
    action VARCHAR(10) NOT NULL, -- 'ENTRY' or 'EXIT'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guard_id INTEGER, -- Future: link to guard user
    notes TEXT
);
```

### Reserved Parking Table

```sql
CREATE TABLE reserved_parking (
    id SERIAL PRIMARY KEY,
    slot_number VARCHAR(10) UNIQUE NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL,
    employee_id VARCHAR(50),
    reserved_from DATE,
    reserved_to DATE,
    is_active BOOLEAN DEFAULT true
);
```

### Guard Users Table

```sql
CREATE TABLE guard_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Monitoring Queries

### Daily Statistics

```sql
SELECT
    vehicle_type,
    total_slots,
    occupied_slots,
    (total_slots - occupied_slots) AS available,
    ROUND((occupied_slots::DECIMAL / total_slots * 100), 2) AS occupancy_rate,
    updated_at AS last_updated
FROM parking_status;
```

### Peak Usage Detection

```sql
-- This would require the parking_history table
SELECT
    DATE(timestamp) AS date,
    vehicle_type,
    MAX(occupied_slots) AS peak_occupancy
FROM parking_history
GROUP BY DATE(timestamp), vehicle_type
ORDER BY date DESC;
```

## Contact

For database-related issues or questions, contact the system administrator.

---

**Last Updated**: 2024
**Schema Version**: 1.0
