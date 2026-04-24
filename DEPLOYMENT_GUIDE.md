# 🚀 Deployment Guide - Lulu Cyber Tower 2 Parking System

This guide will help you deploy your parking management system to Render (free tier) so it's accessible to everyone.

## 📋 Prerequisites

Before you begin, make sure you have:

- A GitHub account
- A Render account (sign up at https://render.com - it's free!)
- Your code pushed to a GitHub repository

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push Your Code to GitHub

If you haven't already, initialize git and push your code:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Prepare for deployment"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## 🗄️ Step 2: Deploy PostgreSQL Database on Render

### 2.1 Create PostgreSQL Database

1. Go to https://render.com and sign in
2. Click **"New +"** button → Select **"PostgreSQL"**
3. Fill in the details:
   - **Name**: `parking-system-db` (or any name you prefer)
   - **Database**: `parking_db`
   - **User**: `parking_user` (will be auto-generated)
   - **Region**: Choose closest to your location
   - **PostgreSQL Version**: 16 (or latest)
   - **Plan**: **Free** (select the free tier)
4. Click **"Create Database"**
5. Wait for the database to be created (takes 1-2 minutes)

### 2.2 Get Database Connection Details

Once created, you'll see:

- **Internal Database URL** (use this for backend)
- **External Database URL** (for external connections)
- **PSQL Command** (for running SQL commands)

**Important**: Copy the **Internal Database URL** - you'll need it for the backend!

### 2.3 Initialize Database Schema

1. On the database page, click **"Connect"** → **"External Connection"**
2. Copy the **PSQL Command** (looks like: `PGPASSWORD=xxx psql -h xxx.render.com -U parking_user parking_db`)
3. Open your terminal and run the PSQL command
4. Once connected, run the initialization script:

```sql
-- Create the parking_status table
CREATE TABLE IF NOT EXISTS parking_status (
    id SERIAL PRIMARY KEY,
    vehicle_type VARCHAR(10) NOT NULL UNIQUE,
    total_slots INTEGER NOT NULL CHECK (total_slots >= 0),
    occupied_slots INTEGER NOT NULL DEFAULT 0 CHECK (occupied_slots >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO parking_status (vehicle_type, total_slots, occupied_slots)
VALUES
    ('bike', 300, 0),
    ('car', 200, 0)
ON CONFLICT (vehicle_type) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_type ON parking_status(vehicle_type);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parking_status_updated_at
    BEFORE UPDATE ON parking_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

5. Type `\q` to exit psql

## 🖥️ Step 3: Deploy Backend on Render

### 3.1 Create Web Service for Backend

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository from the list
4. Fill in the details:
   - **Name**: `parking-system-backend` (or any name)
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### 3.2 Add Environment Variables

In the **Environment Variables** section, add:

| Key            | Value                                             |
| -------------- | ------------------------------------------------- |
| `NODE_ENV`     | `production`                                      |
| `PORT`         | `5000`                                            |
| `DATABASE_URL` | Paste the **Internal Database URL** from Step 2.2 |

**Note**: Render provides `DATABASE_URL` automatically if you link the database, but you can also add it manually.

### 3.3 Update Backend to Use DATABASE_URL

Since Render provides `DATABASE_URL` in a specific format, update your `backend/server.js`:

Add this code after line 6 (after `require("dotenv").config();`):

```javascript
// Parse DATABASE_URL if provided (for Render deployment)
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
```

Then update the Pool initialization (around line 18):

```javascript
const pool = new Pool(dbConfig);
```

4. Click **"Create Web Service"**
5. Wait for deployment (takes 2-5 minutes)
6. Once deployed, you'll get a URL like: `https://parking-system-backend.onrender.com`

**Copy this URL - you'll need it for the frontend!**

## 🌐 Step 4: Deploy Frontend on Render

### 4.1 Create Static Site for Frontend

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository (if not already connected)
3. Select your repository
4. Fill in the details:
   - **Name**: `parking-system-frontend` (or any name)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: **Free**

### 4.2 Add Environment Variable

In the **Environment Variables** section, add:

| Key                 | Value                                                                                |
| ------------------- | ------------------------------------------------------------------------------------ |
| `REACT_APP_API_URL` | Your backend URL from Step 3.3 (e.g., `https://parking-system-backend.onrender.com`) |

### 4.3 Deploy

1. Click **"Create Static Site"**
2. Wait for deployment (takes 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://parking-system-frontend.onrender.com`

**This is your public URL! Share it with everyone! 🎉**

## ✅ Step 5: Verify Deployment

1. Open your frontend URL in a browser
2. You should see the parking dashboard
3. Test the Guard Control Panel:
   - Click "Entry" for cars/bikes
   - Click "Exit" for cars/bikes
   - Verify the dashboard updates in real-time

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Backend won't start

- Check logs in Render dashboard
- Verify `DATABASE_URL` is set correctly
- Ensure database is running

**Problem**: Database connection failed

- Verify database is in the same region as backend
- Check if database initialization script ran successfully
- Try restarting the backend service

### Frontend Issues

**Problem**: Frontend shows "Failed to fetch parking data"

- Verify `REACT_APP_API_URL` is set correctly
- Check if backend is running (visit backend URL in browser)
- Check browser console for CORS errors

**Problem**: Real-time updates not working

- Verify WebSocket connection in browser console
- Check if backend Socket.IO is configured correctly
- Ensure backend allows CORS from frontend domain

### Free Tier Limitations

**Important**: Render's free tier has some limitations:

- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds to wake up
- 750 hours/month of runtime (sufficient for most use cases)

**Solution**: For production use, consider upgrading to paid tier ($7/month) for always-on services.

## 🔄 Updating Your Deployment

When you make changes to your code:

```bash
# Commit your changes
git add .
git commit -m "Your update message"

# Push to GitHub
git push origin main
```

Render will automatically detect the changes and redeploy! 🚀

## 🌟 Custom Domain (Optional)

To use your own domain:

1. Go to your frontend service in Render
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain (e.g., `parking.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate to be issued (automatic)

## 📱 Sharing Your App

Once deployed, share your frontend URL with:

- Security guards (for the control panel)
- Employees (to check parking availability)
- Building management

**Example**: "Check parking availability at: https://parking-system-frontend.onrender.com"

## 🎯 Next Steps

Consider these enhancements:

- Add authentication for guard panel
- Set up monitoring and alerts
- Add analytics to track usage
- Create a mobile app version
- Set up automated backups

## 💡 Tips

1. **Monitor Usage**: Check Render dashboard regularly for service health
2. **Database Backups**: Render provides automatic backups on paid plans
3. **Environment Variables**: Never commit `.env` files to GitHub
4. **SSL**: Render provides free SSL certificates automatically
5. **Logs**: Use Render's log viewer to debug issues

## 🆘 Need Help?

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: Create an issue in your repository

---

**Congratulations! Your parking system is now live and accessible to everyone! 🎉**
