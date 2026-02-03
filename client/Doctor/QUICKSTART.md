# Quick Start Guide - HerCycle Doctor Dashboard

## Step-by-Step Setup

### 1. Install Dependencies
Open your terminal in the `Doctor` folder and run:
```bash
npm run install-all
```
This will install all dependencies for both backend and frontend.

### 2. Start MongoDB
Make sure MongoDB is running on your system.

**Windows:**
- If MongoDB is installed as a service, it should already be running
- Or manually start: `mongod`

**Mac/Linux:**
```bash
mongod
```

### 3. Run the Application
In the same terminal, run:
```bash
npm run dev
```

You should see:
```
[0] [nodemon] starting `node server.js`
[0] Server running on port 5000
[0] MongoDB connected successfully
[1]
[1]   VITE v5.x.x  ready in xxx ms
[1]
[1]   ➜  Local:   http://localhost:3000/
```

### 4. Open Your Browser
Navigate to: **http://localhost:3000**

### 5. Register Your Doctor Account
- Click "Register here"
- Fill in your details
- Click "Register"

### 6. Start Using the Dashboard!
You're all set! You can now:
- Create articles
- Manage categories
- Update your profile
- View statistics

## Troubleshooting

### Port Already in Use
If you get an error about port 5000 or 3000 being in use:

**Backend (port 5000):**
Edit `backend/.env` and change:
```
PORT=5001
```

**Frontend (port 3000):**
Edit `frontend/vite.config.js` and change:
```javascript
server: {
  port: 3001,
  ...
}
```

### MongoDB Connection Error
Make sure:
1. MongoDB is running
2. Connection string in `backend/.env` is correct

### Cannot Find Module Errors
Run:
```bash
npm run install-all
```

## Available Scripts

- `npm run dev` - Run both backend and frontend together
- `npm run server` - Run only backend
- `npm run client` - Run only frontend
- `npm run install-all` - Install all dependencies
- `npm run build` - Build frontend for production

## Need Help?

Check the main [README.md](./README.md) file for detailed documentation.
