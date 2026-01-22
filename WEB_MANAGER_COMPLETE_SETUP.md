# 🌸 Web Manager Dashboard - Complete Setup & Login Instructions

## 📋 TABLE OF CONTENTS
1. [Files Created](#files-created)
2. [Route Configuration](#route-configuration)
3. [Step-by-Step Login Guide](#step-by-step-login-guide)
4. [Dashboard Features](#dashboard-features)
5. [API Integration](#api-integration)
6. [Troubleshooting](#troubleshooting)

---

## 📁 FILES CREATED

### New Files
```
✅ /client/src/pages/WebManager/WebManagerDashboard.jsx
   └─ Main dashboard component with all features
   
✅ /client/src/pages/WebManager/WebManagerDashboard.css
   └─ Complete styling with responsive design
```

### Updated Files
```
✅ /client/src/App.jsx
   ├─ Added import for WebManagerDashboard
   └─ Added route: /web-manager-dashboard
```

---

## 🔧 ROUTE CONFIGURATION

### Import Statement
**File**: `client/src/App.jsx` (Line 15)
```jsx
import WebManagerDashboard from './pages/WebManager/WebManagerDashboard';
```

### Route Definition
**File**: `client/src/App.jsx` (Line 41)
```jsx
<Route path="/web-manager-dashboard" element={<WebManagerDashboard />} />
```

### Full App.jsx Structure
```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WebManagerDashboard from './pages/WebManager/WebManagerDashboard';
// ... other imports

function App() {
  return (
    <Router>
      <GradientBackground>
        <Routes>
          {/* Existing routes */}
          <Route path="/login" element={<Login />} />
          {/* ... other routes */}
          <Route path="/web-manager-dashboard" element={<WebManagerDashboard />} />
        </Routes>
      </GradientBackground>
    </Router>
  );
}
```

---

## 👤 STEP-BY-STEP LOGIN GUIDE

### STEP 1: Ensure System is Ready
```
✓ MongoDB running
✓ Backend server running on http://localhost:5000
✓ Frontend server running on http://localhost:5173 
✓ Web manager account exists in database with role='web_manager'
```

### STEP 2: Navigate to Login Page
```
URL: http://localhost:5173/login
```

You should see:
- 🌸 HerCycle Login Form
- Email input field
- Password input field
- Login button
- Register link
- Forgot Password link

### STEP 3: Enter Web Manager Credentials

**Your Email:**
```
[Your registered web manager email]
Example: webmanager@example.com
```

**Your Password:**
```
[Your password]
Example: password123
```

### STEP 4: Click Login Button

The system will:
1. Send credentials to backend
2. Backend validates credentials
3. Backend checks user role
4. Backend returns user data + JWT token
5. Frontend stores token and user data
6. Frontend checks if role === 'web_manager'
7. Redirects to dashboard

### STEP 5: Dashboard Loads Automatically

You'll see:
- 🌸 Web Manager Dashboard header
- User name displayed in top-right
- Logout button
- Navigation tabs (Overview, Landing Page, Fundraising, etc.)
- Dashboard content

---

## 🎨 DASHBOARD FEATURES

### 1️⃣ OVERVIEW TAB (📊)
**What it shows:**
- Landing Pages count (managed)
- Active Campaigns count
- Total Donations count (number of donors)
- Total Funds Raised (in Rupees)
- Recent campaign performance with individual stats

**What you can do:**
- View all-at-a-glance metrics
- See which campaigns are performing best
- Track fundraising progress

### 2️⃣ LANDING PAGE TAB (🏠)
**What it shows:**
- Hero section editor
- About section editor
- Forms to edit content

**What you can do:**
- Edit hero badge text
- Change main heading
- Update subheading
- Edit about section title & descriptions
- Save changes to database

**Fields:**
```
Hero Section:
├─ Badge Text (e.g., "Empowering Women")
├─ Main Heading (e.g., "Your Circle of Strength")
└─ Subheading (longer description)

About Section:
├─ Title
├─ Description 1
└─ Description 2
```

### 3️⃣ FUNDRAISING TAB (💰)
**What it shows:**
- Fundraising page content editor
- Campaign information forms

**What you can do:**
- Edit fundraising badge text
- Update main heading & description
- Edit campaign information
- Save changes to database

### 4️⃣ CAMPAIGNS TAB (🎯)
**What it shows:**
- Create New Campaign form
- Active campaigns list

**What you can do:**
- **Create New Campaign:**
  - Enter campaign title
  - Write description
  - Set fundraising goal (Rs.)
  - Select category (Education, Healthcare, Emergency, Community)
  - Choose emoji/icon
  - Submit for admin approval
  
- **View Active Campaigns:**
  - See all created campaigns
  - Check campaign status (Active/Inactive/Pending)
  - View goal amount
  - See amount raised
  - Check number of donors

### 5️⃣ DONATIONS TAB (💳)
**What it shows:**
- Analytics summary (total donations, funds raised, average)
- Campaign-wise donation breakdown
- Detailed donations table

**What you can do:**
- View total donations received
- See campaign-wise analytics
- Check donor details (name, email, campaign, amount, date)
- Export/view donation records
- Track campaign performance

**Analytics Include:**
```
├─ Total Donations (count)
├─ Total Amount Raised (Rs.)
├─ Average Donation (Rs.)
├─ Campaign-wise breakdown
│  ├─ Campaign name
│  ├─ Total amount raised
│  └─ Number of donors
└─ Recent donations table
   ├─ Donor name
   ├─ Email
   ├─ Campaign
   ├─ Amount
   ├─ Status
   └─ Date
```

### 6️⃣ PROFILE TAB (👤)
**What it shows:**
- Personal information form

**What you can do:**
- Edit full name
- View email (read-only)
- Change contact number
- Select gender
- Update date of birth
- Save profile changes

---

## 🔐 AUTHENTICATION & SECURITY

### Login Process
```
USER ENTERS CREDENTIALS
        ↓
FRONTEND SENDS POST /api/auth/login
        ↓
BACKEND VALIDATES:
├─ Email exists
├─ Password matches
└─ Account is active
        ↓
BACKEND RETURNS:
├─ JWT Token (expires in 7 days)
└─ User object with role='web_manager'
        ↓
FRONTEND STORES:
├─ authToken in localStorage
└─ user object in localStorage
        ↓
FRONTEND CHECKS:
└─ role === 'web_manager'
        ↓
REDIRECT TO /web-manager-dashboard
```

### Storage Details
```javascript
// In browser localStorage:

authToken:
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

user: {
  user_id: "507f1f77bcf86cd799439011",
  NIC: "123456789",
  full_name: "John Manager",
  email: "webmanager@example.com",
  role: "web_manager",
  user_type: "web_manager",
  contact_number: "+94771234567",
  gender: "male",
  date_of_birth: "1990-01-15",
  isExisting: "active"
}
```

### Security Features
✅ JWT Token validation on every API request  
✅ Role-based access control  
✅ Protected routes (dashboard checks role)  
✅ Auto-redirect if token expires  
✅ Logout clears all credentials  

---

## 🔌 API INTEGRATION

### Endpoints Used

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| POST | `/api/auth/login` | Login with credentials | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/landing-page/admin` | Fetch landing page | Yes |
| PUT | `/api/landing-page/admin` | Update landing page | Yes |
| GET | `/api/fundraising` | Fetch fundraising | Yes |
| PUT | `/api/fundraising/admin` | Update fundraising | Yes |
| GET | `/api/payment/donations` | Get all donations | Yes |

### API Request Headers
```javascript
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Example API Call in Dashboard
```javascript
const token = localStorage.getItem('authToken');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

const response = await fetch('http://localhost:5000/api/landing-page/admin', {
  headers: headers
});
```

---

## 🐛 TROUBLESHOOTING

### Problem 1: "Invalid Credentials" Error
**Cause**: Email or password doesn't match, or user doesn't exist  
**Solution**:
1. Verify web manager account exists in database
2. Double-check email spelling (case-sensitive)
3. Ensure password is correct
4. Check that user role is 'web_manager' in database

### Problem 2: Login Loops Back to Login Page
**Cause**: User role is not 'web_manager'  
**Solution**:
1. Check localStorage.getItem('user').role
2. Verify backend returns role: 'web_manager'
3. Update user in database if needed
4. Log in again

### Problem 3: "Cannot GET /web-manager-dashboard"
**Cause**: Route not properly configured  
**Solution**:
1. Check App.jsx has the import statement
2. Verify route is added to Routes section
3. Check component path is correct
4. Restart frontend server

### Problem 4: Dashboard Shows No Data
**Cause**: API calls failing or backend not running  
**Solution**:
1. Check backend is running on port 5000
2. Check MongoDB is connected
3. Open browser DevTools (F12) → Network tab
4. Check API response status and data
5. Check console for error messages

### Problem 5: "Network Error" on Dashboard
**Cause**: Backend server not running or unreachable  
**Solution**:
1. Start backend: `npm start` (in server folder)
2. Verify backend URL is http://localhost:5000
3. Check firewall settings
4. Check network connectivity

### Problem 6: Logout Doesn't Work
**Cause**: Logout button not functioning properly  
**Solution**:
1. Clear browser cache
2. Check localStorage is enabled
3. Hard refresh page (Ctrl+Shift+R)
4. Try again

### Problem 7: Changes Not Saving
**Cause**: API endpoint not implemented or user lacks permissions  
**Solution**:
1. Check browser console for error messages
2. Check Network tab for API response
3. Verify backend has PUT endpoint implemented
4. Check user has proper permissions

### Browser Console Debugging
```javascript
// Check if logged in
console.log(localStorage.getItem('authToken'));
console.log(JSON.parse(localStorage.getItem('user')));

// Check user role
console.log(JSON.parse(localStorage.getItem('user')).role);

// Clear all data
localStorage.clear();
```

---

## 🔄 LOGOUT PROCESS

### How to Logout
```
1. Click "Logout" button in top-right corner
   (Next to your name in the header)

2. System will:
   ├─ Clear localStorage (token + user)
   ├─ Clear all session data
   └─ Redirect to /login

3. You're logged out!
```

### What Gets Cleared
```javascript
localStorage.removeItem('authToken');
localStorage.removeItem('user');
```

---

## 📱 RESPONSIVE DESIGN

The dashboard works on all devices:

### Desktop (1024px and above)
✅ Full featured layout  
✅ All content visible  
✅ Smooth animations  

### Tablet (768px - 1023px)
✅ Optimized grid layout  
✅ Responsive cards  
✅ Touch-friendly buttons  

### Mobile (Below 768px)
✅ Single column layout  
✅ Stacked elements  
✅ Large touch targets  
✅ Full functionality  

---

## 🚀 PRODUCTION DEPLOYMENT

### Before Going Live
- [ ] Create web manager user accounts
- [ ] Test login with different credentials
- [ ] Test all dashboard features
- [ ] Update API URLs to production
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure CORS for production domain
- [ ] Test on mobile devices

### Production URL Structure
```
Frontend: https://yourdomain.com
Backend: https://api.yourdomain.com
Database: MongoDB (production cluster)
```

### Environment Variables
Update API endpoints in code:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

---

## 📊 QUICK STATS

**Files Created**: 2  
**Files Modified**: 1  
**API Endpoints Used**: 7  
**Dashboard Tabs**: 6  
**Features**: 15+  
**Responsive Breakpoints**: 3  

---

## ✅ VERIFICATION CHECKLIST

Use this to verify everything is working:

### Setup Verification
- [ ] WebManagerDashboard.jsx exists in `/pages/WebManager/`
- [ ] WebManagerDashboard.css exists in `/pages/WebManager/`
- [ ] App.jsx has import statement
- [ ] App.jsx has route `/web-manager-dashboard`

### Login Verification
- [ ] Can navigate to /login
- [ ] Can enter credentials
- [ ] Successful login redirects to dashboard
- [ ] localStorage has authToken and user

### Dashboard Verification
- [ ] Dashboard displays header with user name
- [ ] All 6 tabs are clickable
- [ ] Can switch between tabs
- [ ] Data loads in each tab
- [ ] Forms are editable
- [ ] Logout button works

### API Verification
- [ ] Landing page data loads
- [ ] Fundraising data loads
- [ ] Donations data loads
- [ ] Can save landing page changes
- [ ] Can save profile changes

---

**Status**: ✅ Ready to Use  
**Last Updated**: January 19, 2026  
**Version**: 1.0  

For questions or issues, check the troubleshooting section or review browser console logs.
