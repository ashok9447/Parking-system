# 🚀 Quick Start Guide

Get your parking management system up and running in 5 minutes!

## Prerequisites Check

Before starting, verify you have:

- ✅ Node.js installed: `node --version` (should be v14+)
- ✅ PostgreSQL installed: `psql --version` (should be v12+)
- ✅ PostgreSQL running: `pg_isready`

## Step-by-Step Setup

### 1️⃣ Database Setup (2 minutes)

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE ashokr;"

# Initialize the schema
psql -U postgres -d ashokr -f backend/init-db.sql
```

**Expected Output:**

```
CREATE TABLE
INSERT 0 2
CREATE INDEX
...
```

### 2️⃣ Backend Setup (1 minute)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the server
node server.js
```

**Expected Output:**

```
Database connected successfully
Server running on port 5000
```

### 3️⃣ Frontend Setup (2 minutes)

Open a **new terminal** window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

**Expected Output:**

```
Compiled successfully!
You can now view frontend in the browser.
Local: http://localhost:3000
```

## 🎉 You're Done!

Your browser should automatically open to `http://localhost:3000`

You should see:

- **Left Panel**: Guard Control Panel with Entry/Exit buttons
- **Right Panel**: Real-time parking dashboard showing:
  - 🏍️ Bike Parking: 300 total slots, 0 occupied
  - 🚗 Car Parking: 200 total slots, 0 occupied

## 🧪 Test It Out

1. Click **"Car Entry"** button → Watch the car occupied count increase
2. Click **"Bike Entry"** button → Watch the bike occupied count increase
3. Click **"Car Exit"** button → Watch the car occupied count decrease
4. Open another browser tab to `http://localhost:3000` → See real-time updates!

## ⚠️ Troubleshooting

### Database Connection Error

**Problem**: `Error connecting to database`

**Solution**:

```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it:
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Windows:
# Start PostgreSQL service from Services app
```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:

```bash
# Find and kill the process using port 5000
lsof -i :5000
kill -9 <PID>

# Or use a different port in backend/.env:
PORT=5001
```

### Frontend Can't Connect to Backend

**Problem**: Network errors in browser console

**Solution**:

1. Verify backend is running: `curl http://localhost:5000/parking/status`
2. Check backend terminal for errors
3. Ensure no firewall is blocking port 5000

### Database Not Found

**Problem**: `database "ashokr" does not exist`

**Solution**:

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE ashokr;"

# Then run the init script again
psql -U postgres -d ashokr -f backend/init-db.sql
```

## 📱 Access from Other Devices

To access the dashboard from other devices on your network:

1. Find your computer's IP address:

   ```bash
   # macOS/Linux:
   ifconfig | grep "inet "

   # Windows:
   ipconfig
   ```

2. Update frontend to use your IP:
   - Edit `frontend/src/App.js` and `frontend/src/GuardPanel.js`
   - Replace `http://localhost:5000` with `http://YOUR_IP:5000`

3. Access from other devices:
   - Dashboard: `http://YOUR_IP:3000`

## 🔄 Stopping the Application

1. **Stop Frontend**: Press `Ctrl+C` in the frontend terminal
2. **Stop Backend**: Press `Ctrl+C` in the backend terminal

## 🔄 Restarting

```bash
# Backend (in backend directory)
node server.js

# Frontend (in frontend directory)
npm start
```

## 📊 Resetting Parking Data

To reset all parking slots to zero:

```bash
psql -U postgres -d ashokr -c "UPDATE parking_status SET occupied_slots = 0;"
```

## 🎯 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DATABASE_SCHEMA.md](backend/DATABASE_SCHEMA.md) for database details
- Customize parking slot numbers in the database
- Deploy to production (see README.md)

## 💡 Tips

- Keep both terminal windows open while using the app
- The dashboard updates automatically via WebSocket
- Guards can use the left panel to manage entries/exits
- Employees can view the dashboard to check availability

## 🆘 Still Having Issues?

1. Check all prerequisites are installed
2. Verify PostgreSQL is running
3. Ensure ports 3000 and 5000 are available
4. Check terminal output for specific error messages
5. Review the full README.md for detailed troubleshooting

---

**Happy Parking! 🚗🏍️**
