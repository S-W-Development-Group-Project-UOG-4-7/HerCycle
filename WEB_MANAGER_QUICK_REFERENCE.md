# 🌸 Web Manager Quick Reference

## ✅ SETUP COMPLETE

The Web Manager Dashboard has been successfully integrated into your HER CYCLE project.

---

## 📍 QUICK ACCESS

### File Locations
```
📂 Dashboard Component
   └─ c:\Github\HerCycle\client\src\pages\WebManager\
      ├─ WebManagerDashboard.jsx  (Main component)
      └─ WebManagerDashboard.css  (Styles)

📂 Updated Routing
   └─ c:\Github\HerCycle\client\src\App.jsx
      (Route added: /web-manager-dashboard)

📂 Documentation
   └─ c:\Github\HerCycle\WEB_MANAGER_LOGIN_GUIDE.md
      (Complete login guide)
```

---

## 🔓 HOW TO LOGIN

### Direct URL
```
http://localhost:3000/login
```

### Credentials
```
Role: web_manager
Email: [registered web manager email]
Password: [password]
```

### After Login
```
✅ Automatically redirected to:
   http://localhost:3000/web-manager-dashboard
```

---

## 🎯 DASHBOARD FEATURES

| Feature | Icon | Function |
|---------|------|----------|
| Overview | 📊 | View all statistics and metrics |
| Landing Page | 🏠 | Edit landing page content |
| Fundraising | 💰 | Manage fundraising pages |
| Campaigns | 🎯 | Create & manage donation campaigns |
| Donations | 💳 | View donations & analytics |
| Profile | 👤 | Edit personal information |

---

## 🔐 AUTHENTICATION

### Login Flow
```
1. Enter credentials at /login
2. Backend validates user
3. Returns JWT token + user data
4. Frontend stores in localStorage
5. Checks role === 'web_manager'
6. Redirects to dashboard
```

### Storage
```javascript
// Token
localStorage.getItem('authToken')

// User Data
localStorage.getItem('user')
// Contains: role, email, name, contact, etc.
```

### Logout
```
Click "Logout" button in top-right corner
→ Clears localStorage
→ Redirects to /login
```

---

## 🔌 API ENDPOINTS USED

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/landing-page/admin` | Fetch landing page |
| PUT | `/api/landing-page/admin` | Update landing page |
| GET | `/api/fundraising` | Fetch fundraising |
| PUT | `/api/fundraising/admin` | Update fundraising |
| GET | `/api/payment/donations` | Get donations |

---

## 🎨 RESPONSIVE DESIGN

✅ **Desktop**: Full featured layout  
✅ **Tablet**: Optimized grid layout  
✅ **Mobile**: Single column, touch-friendly  

---

## 🚀 DEPLOYMENT CHECKLIST

Before going live:

- [ ] Create Web Manager user accounts with role: 'web_manager'
- [ ] Update API endpoints from localhost to production URL
- [ ] Test login and dashboard functionality
- [ ] Verify localStorage permissions in browser
- [ ] Test all CRUD operations
- [ ] Verify JWT token validation
- [ ] Test logout and re-login
- [ ] Check responsive design on mobile
- [ ] Enable HTTPS in production

---

## 📝 WEB MANAGER USER CREATION

To create a web manager account in the database:

```javascript
// Example MongoDB insert
db.users.insertOne({
  NIC: "123456789",
  full_name: "John Manager",
  email: "manager@example.com",
  password_hash: "[hashed password]",
  role: "web_manager",  // IMPORTANT!
  contact_number: "+94771234567",
  gender: "male",
  date_of_birth: "1990-01-15",
  isExisting: "active",
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
});
```

---

## 🐛 TROUBLESHOOTING

### "Login page loops back"
- Check user.role in localStorage
- Verify backend returns role: 'web_manager'

### "Dashboard not showing data"
- Check backend is running on port 5000
- Verify MongoDB is connected
- Check browser console for API errors

### "Cannot access dashboard"
- Ensure token is stored in localStorage
- Check if token is expired
- Try logging in again

### "Logout doesn't work"
- Clear browser cache
- Check localStorage is enabled
- Try clearing localStorage manually

---

## 📊 DATA FLOW

```
Web Manager Login
       ↓
Credentials Sent to Backend
       ↓
Backend Validates & Returns User
       ↓
Frontend Stores Token & User Data
       ↓
Dashboard Loads
       ↓
Fetches Landing Page Data
Fetches Fundraising Data
Fetches Donations Data
       ↓
Displays on Dashboard
```

---

## 🎯 NEXT STEPS

1. **Test Login**
   - Navigate to `/login`
   - Enter web manager credentials
   - Verify redirect to dashboard

2. **Test Features**
   - Edit landing page
   - Create campaign
   - View donations

3. **Test API Integration**
   - Check network tab in DevTools
   - Verify API responses
   - Check error handling

4. **Production Deployment**
   - Update API URLs
   - Create production users
   - Enable HTTPS
   - Set up database backups

---

## 📞 SUPPORT

**Documentation**: See WEB_MANAGER_LOGIN_GUIDE.md  
**Component**: WebManagerDashboard.jsx  
**Routes**: App.jsx  

For detailed information, refer to the comprehensive login guide included in the project.

---

**Status**: ✅ Ready to Use  
**Date**: January 19, 2026  
**Version**: 1.0
