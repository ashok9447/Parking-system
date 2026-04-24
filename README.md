# 🏢 Lulu Cyber Tower 2 - Parking Management System

A real-time parking management system for Lulu Cyber Tower 2 office building. This application helps employees check parking availability before coming to the office, reducing frustration and improving the parking experience.

## 📋 Features

- **Real-time Updates**: Automatic dashboard updates using WebSocket technology
- **Dual Vehicle Support**: Separate tracking for cars and bikes
- **Guard Control Panel**: Easy-to-use interface for security guards to manage entries/exits
- **Visual Dashboard**: Color-coded status indicators and progress bars
- **Validation**: Prevents negative slots and overfilling
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Backend

- **Node.js** with Express.js
- **PostgreSQL** database for data persistence
- **Socket.IO** for real-time updates
- RESTful API endpoints

### Frontend

- **React** for UI components
- **Axios** for HTTP requests
- **Socket.IO Client** for real-time updates
- Modern CSS with gradient backgrounds

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd parking-system
```

### 2. Database Setup

#### Start PostgreSQL

Make sure PostgreSQL is running on your system.

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (if not exists)
CREATE DATABASE ashokr;

# Exit psql
\q
```

#### Initialize Database Schema

```bash
# Run the initialization script
psql -U postgres -d ashokr -f backend/init-db.sql
```

This will create:

- `parking_status` table with proper constraints
- Initial data (300 bike slots, 200 car slots)
- Indexes for performance
- Triggers for automatic timestamp updates

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your database credentials
# DB_USER=postgres
# DB_HOST=localhost
# DB_NAME=ashokr
# DB_PASSWORD=your_password
# DB_PORT=5433
# PORT=5000

# Start the backend server
node server.js
```

The backend server will start on `http://localhost:5000`

### 4. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## 🎯 Usage

### For Security Guards

1. Access the Guard Control Panel on the left side of the screen
2. Click **Entry** button when a vehicle enters the parking area
3. Click **Exit** button when a vehicle leaves the parking area
4. The system will:
   - Validate the action (prevent negative slots or overfilling)
   - Update the database
   - Broadcast changes to all connected dashboards
   - Show success/error messages

### For Employees

1. Open the application in your browser
2. View real-time parking availability for:
   - **Cars**: Total, Occupied, and Available slots
   - **Bikes**: Total, Occupied, and Available slots
3. Status indicators show:
   - 🟢 **Available**: Plenty of parking spaces
   - ⚠️ **Limited**: More than 80% occupied
   - 🔴 **FULL**: No available slots
4. Progress bars show occupancy percentage

## 🔧 Configuration

### Parking Slot Configuration

To modify the total number of parking slots, update the database:

```sql
-- Update car parking slots
UPDATE parking_status
SET total_slots = 250
WHERE vehicle_type = 'car';

-- Update bike parking slots
UPDATE parking_status
SET total_slots = 350
WHERE vehicle_type = 'bike';
```

### Port Configuration

- **Backend Port**: Edit `PORT` in `backend/.env` (default: 5000)
- **Frontend Port**: React runs on port 3000 by default
- **Database Port**: Edit `DB_PORT` in `backend/.env` (default: 5433)

## 📁 Project Structure

```
parking-system/
├── backend/
│   ├── server.js           # Express server with Socket.IO
│   ├── package.json        # Backend dependencies
│   ├── init-db.sql         # Database initialization script
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── App.js          # Main dashboard component
│   │   ├── App.css         # Styling
│   │   ├── GuardPanel.js   # Guard control interface
│   │   └── index.js        # React entry point
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🔌 API Endpoints

### GET `/parking/status`

Returns current parking status for all vehicle types.

**Response:**

```json
[
  {
    "id": 1,
    "vehicle_type": "bike",
    "total_slots": 300,
    "occupied_slots": 45,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:30:00.000Z"
  },
  {
    "id": 2,
    "vehicle_type": "car",
    "total_slots": 200,
    "occupied_slots": 120,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:30:00.000Z"
  }
]
```

### POST `/parking/car-entry`

Records a car entering the parking area.

**Response:**

```json
{
  "message": "Car entry recorded successfully"
}
```

### POST `/parking/car-exit`

Records a car leaving the parking area.

### POST `/parking/bike-entry`

Records a bike entering the parking area.

### POST `/parking/bike-exit`

Records a bike leaving the parking area.

## 🔄 WebSocket Events

### `parkingUpdated`

Emitted whenever parking status changes. Clients should refresh their data when receiving this event.

## 🐛 Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `backend/.env`
- Ensure database exists: `psql -U postgres -l`

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Frontend Not Connecting to Backend

- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure Socket.IO connection is established

### Negative Slot Values

The system now prevents this with validation. If you see negative values:

```sql
-- Reset to zero
UPDATE parking_status
SET occupied_slots = 0
WHERE occupied_slots < 0;
```

## 🚀 Production Deployment

### Backend

1. Set `NODE_ENV=production` in environment
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name parking-backend
   ```
3. Configure PostgreSQL for production
4. Set up SSL/TLS certificates
5. Use environment variables for sensitive data

### Frontend

1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve the `build` folder using nginx or similar
3. Update API endpoints to production URLs

## 📝 Future Enhancements

- [ ] User authentication for guards
- [ ] Historical data and analytics
- [ ] Mobile app (React Native)
- [ ] Email/SMS notifications when parking is full
- [ ] Reserved parking slots
- [ ] Integration with access control systems
- [ ] Multi-building support
- [ ] Parking duration tracking
- [ ] Payment integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support or questions, please contact the IT department at Lulu Cyber Tower 2.

---

**Built with ❤️ for Lulu Cyber Tower 2 employees**
