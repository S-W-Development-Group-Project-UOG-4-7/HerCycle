# 🌸 Web Manager Dashboard - Login Guide

## Overview
The Web Manager Dashboard is now integrated into the HER CYCLE platform. Web Managers can log in, manage landing pages, fundraising campaigns, donations, and their profile.

---

## 📋 How to Login as Web Manager

### Step 1: Access the Login Page
- Navigate to: `http://localhost:/login` (or your frontend URL)
- Or click the "Login" link from the landing page

### Step 2: Enter Web Manager Credentials
```
Email: [Your Web Manager Email]
Password: [Your Web Manager Password]
```

**Example Test Credentials:**
```
Email: webmanager@example.com
Password: webmanager123
```

> **Note:** The Web Manager account must exist in the database with `role: 'web_manager'`

### Step 3: System Automatically Redirects
After successful login, the system automatically detects the user role and redirects:

```
Web Manager Role → /web-manager-dashboard
Admin Role → /admin-dashboard
Doctor Role → /doctor-dashboard
Regular User → /dashboard
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. User enters email & password on Login Page          │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  2. POST /api/auth/login (backend verification)         │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  3. Backend checks credentials & returns user data      │
│     with role: 'web_manager'                            │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  4. Frontend stores:                                    │
│     - authToken (JWT)                                   │
│     - user (localStorage)                               │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  5. App checks user.role === 'web_manager'             │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  6. Redirect to /web-manager-dashboard                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Web Manager Dashboard Features

Once logged in, Web Managers have access to:

### 1. **📊 Dashboard Overview**
   - Total Landing Pages managed
   - Active Campaigns count
   - Total Donations received
   - Total Funds Raised (in Rupees)
   - Campaign performance metrics

### 2. **🏠 Landing Page Management**
   - Edit Hero Section (Badge text, Main heading, Subheading)
   - Manage About Section (Title, descriptions)
   - Save changes directly to database
   - Real-time updates

### 3. **💰 Fundraising Page Management**
   - Edit fundraising page content
   - Update campaign information
   - Manage fundraising goals
   - Publish or save as draft

### 4. **🎯 Campaign Management**
   - Create new donation campaigns
   - Add campaign title, description, goals
   - Select category (Education, Healthcare, Emergency, Community)
   - Submit campaigns for admin approval
   - View all active campaigns

### 5. **💳 Donation Analytics**
   - View total donations received
   - See donation amounts
   - Campaign-wise donation breakdown
   - Donor information (name, email, phone)
   - Visual progress bars showing campaign performance
   - Export donation records

### 6. **👤 Profile Management**
   - Edit personal information
   - Update contact details
   - Change gender and DOB
   - Save profile changes

---

## 📂 File Structure

```
client/src/pages/WebManager/
├── WebManagerDashboard.jsx       # Main dashboard component
└── WebManagerDashboard.css       # Dashboard styles
```

### Updated Files:
```
client/src/App.jsx                # Added route and import
```

---

## 🔧 Technical Details

### Route Configuration
**File:** `client/src/App.jsx`

```jsx
import WebManagerDashboard from './pages/WebManager/WebManagerDashboard';

<Route path="/web-manager-dashboard" element={<WebManagerDashboard />} />
```

### Authentication Check
**File:** `client/src/pages/WebManager/WebManagerDashboard.jsx`

```javascript
// Verify user is logged in and has web_manager role
const userData = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('authToken');

if (!userData || !token) {
  navigate('/login');
  return;
}

if (userData.role !== 'web_manager') {
  navigate('/login');  // Prevent unauthorized access
  return;
}
```

### API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/landing-page/admin` | Fetch landing page content |
| PUT | `/api/landing-page/admin` | Update landing page |
| GET | `/api/fundraising` | Fetch fundraising data |
| PUT | `/api/fundraising/admin` | Update fundraising page |
| GET | `/api/payment/donations` | Get all donations |
| GET | `/api/auth/me` | Get current user info |

---

## 🚀 Step-by-Step Login Process

### 1. Before Logging In
```
- Make sure MongoDB is running
- Backend server is running on http://localhost:5000
- Frontend server is running on http://localhost:3000 (or 5173)
```

### 2. Go to Login Page
```
URL: http://localhost:3000/login
```

### 3. Enter Web Manager Credentials
```
Email: [Your registered web manager email]
Password: [Your password]
```

### 4. Click "Login" Button
- System validates credentials
- Retrieves user data from backend
- Stores authentication token

### 5. Automatic Redirect
- ✅ If role === 'web_manager': Redirects to `/web-manager-dashboard`
- ❌ If role !== 'web_manager': Stays on login with error message

### 6. Access Dashboard
- Welcome message shows user name
- All dashboard features available
- Can navigate between tabs using top navigation

---

## 🔑 Authentication Storage

### localStorage Contents After Login:

```javascript
// JWT Token
localStorage.getItem('authToken')
// Output: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// User Data
localStorage.getItem('user')
// Output:
{
  "user_id": "507f1f77bcf86cd799439011",
  "NIC": "123456789",
  "full_name": "John Manager",
  "email": "webmanager@example.com",
  "role": "web_manager",
  "user_type": "web_manager",
  "contact_number": "+94771234567",
  "gender": "male",
  "date_of_birth": "1990-01-15",
  "profile_picture": null
}
```

---

## 🛡️ Security Features

✅ **JWT Token Authentication**
- Tokens stored in localStorage
- Validated on each API request
- Auto-redirects to login if token expires

✅ **Role-Based Access Control**
- Web Manager can only access their dashboard
- Other roles redirected to their respective dashboards
- Profile verification on every page load

✅ **Protected Routes**
- Dashboard checks user role before rendering
- Unauthorized users redirected to login
- API requests include authorization header

---

## 🔄 Logout Process

Click "Logout" button on the dashboard header:

```javascript
// Clears localStorage
localStorage.removeItem('authToken');
localStorage.removeItem('user');

// Redirects to login
navigate('/login');
```

---

## ⚠️ Troubleshooting

### Issue: "Invalid credentials" error
**Solution:**
- Verify the web manager account exists in database
- Check email and password are correct
- Make sure backend server is running

### Issue: Redirects to wrong dashboard
**Solution:**
- Check the `role` field in user object
- Verify backend returns `role: 'web_manager'`
- Clear localStorage and login again

### Issue: Dashboard not loading
**Solution:**
- Check browser console for errors (F12)
- Verify API endpoints are accessible
- Confirm backend is running on port 5000
- Check network tab to see API responses

### Issue: "Cannot get /web-manager-dashboard"
**Solution:**
- Ensure route is added to App.jsx
- Component import is correct
- React Router is properly configured

---

## 🎨 Dashboard Navigation

### Top Navigation Bar (Tab Menu)
```
📊 Overview      | 🏠 Landing Page | 💰 Fundraising
🎯 Campaigns     | 💳 Donations    | 👤 Profile
```

### Logout
Located in the top-right corner of the header

### Message Alerts
- Success messages (green) appear when actions complete
- Error messages (red) appear when issues occur
- Click × to close alerts

---

## 📱 Responsive Design

The dashboard is fully responsive:

| Device | Behavior |
|--------|----------|
| **Desktop (1024px+)** | Full layout with all features visible |
| **Tablet (768px-1023px)** | Optimized grid layout, compact spacing |
| **Mobile (< 768px)** | Single column layout, stacked elements, touch-friendly |

---

## 🌐 Deployment

### Production Setup

1. **Backend:**
   ```
   Server running on production URL
   Database connected to production MongoDB
   ```

2. **Frontend:**
   ```
   Build: npm run build
   Deploy to production server
   Update API endpoints to production URLs
   ```

3. **Environment Variables:**
   - Update API base URL from localhost:5000 to production URL
   - Update frontend URL from localhost:3000 to production URL

---

## 📧 Support

For issues or questions:
- Check browser console (F12 → Console tab)
- Verify backend server is running
- Check MongoDB connection
- Review API response in Network tab

---

**Last Updated:** January 19, 2026  
**Version:** 1.0  
**Status:** ✅ Ready for Use
