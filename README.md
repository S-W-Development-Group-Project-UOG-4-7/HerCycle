# HerCycle 💜

> A comprehensive women's health and wellness platform built with the MERN stack

HerCycle is a full-stack web application designed to support women's health journey through menstrual cycle tracking, community forums, doctor consultations, fundraising campaigns, and educational resources.

---

## 🌟 Features

### For Users
- **👤 User Authentication** - Secure registration, login, and password recovery
- **📅 Cycle Tracking** - Track menstrual cycles, symptoms, and health patterns
- **💬 Community Forum** - Share experiences, ask questions, and connect with others
- **👨‍⚕️ Doctor Consultations** - Access verified medical professionals
- **💰 Fundraising** - Support health-related campaigns with Stripe integration
- **📚 Educational Resources** - Access women's health information and guides

### For Doctors
- **✅ Verification System** - Email-based doctor verification by admins
- **📝 Professional Posts** - Share medical insights with verified badge
- **👥 Patient Engagement** - Answer health questions from the community

### For Admins
- **📊 Analytics Dashboard** - Real-time insights on users, donations, posts
- **⚠️ User Management** - Issue warnings, suspend users, manage roles
- **✉️ Email Notifications** - Automated emails for warnings, approvals, suspensions
- **🔍 Content Moderation** - Review and manage community posts/comments
- **👨‍💼 Web Manager Control** - Manage staff roles and permissions

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library with hooks
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization charts
- **Axios** - HTTP client for API requests
- **Stripe.js** - Payment integration

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Multer** - File upload middleware
- **Stripe** - Payment processing

---

## 📁 Project Structure

```
HerCycle/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/          # Page components (Admin, Landing, etc.)
│   │   │   ├── Admin/      # Admin dashboard with analytics
│   │   │   ├── LandingPage/
│   │   │   ├── Login/
│   │   │   └── ...
│   │   ├── App.jsx         # Main app with routing
│   │   └── index.css       # Global styles
│   ├── public/             # Static assets
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Express backend
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── ...
│   ├── routes/             # API route modules (future refactoring)
│   ├── server.js           # Main server file with all endpoints
│   ├── setup.js            # Database initialization
│   ├── seed.js             # Sample data seeding
│   ├── emailService.js     # Email utility functions
│   ├── .env                # Environment variables (not in git)
│   ├── .env.example        # Environment template
│   └── package.json
│
├── CONTRIBUTING.md          # Team contribution guidelines
├── README.md               # This file
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **MongoDB** 6+ ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/downloads))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/HerCycle.git
   cd HerCycle
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Set up environment variables**
   
   Copy the example file and configure:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hercycle
   JWT_SECRET=your-secret-key-here
   EMAIL_USER=hercyle806@gmail.com
   EMAIL_PASS=your-gmail-app-password
   STRIPE_SECRET_KEY=sk_test_your_key
   PORT=5000
   ```

5. **(Optional) Seed the database**
   ```bash
   npm run seed
   ```

### Running the Application

Open two terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend Client:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Visit **http://localhost:5173** in your browser!

### Default Admin Credentials

After seeding, you can log in as admin:
- **Email**: `admin@hercycle.com`
- **Password**: `Admin@123`

---

## 📧 Email Configuration

HerCycle uses Gmail to send transactional emails. To enable email functionality:

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate an App Password**:
   - Go to [Google Account → Security → App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. **Update `.env`**:
   ```env
   EMAIL_USER=hercyle806@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

Emails are sent for:
- Password resets
- Doctor verification approvals/rejections
- User warnings
- Account suspensions

---

## 💳 Stripe Payment Setup

1. Create a [Stripe account](https://stripe.com/)
2. Get your test API keys from the [dashboard](https://dashboard.stripe.com/test/apikeys)
3. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

---

## 🏗️ Build for Production

### Client
```bash
cd client
npm run build
# Creates optimized build in client/dist/
```

### Server
```bash
cd server
NODE_ENV=production npm start
```

---

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/forgot-password` - Request password reset
- `POST /api/verify-reset-code` - Verify reset code
- `POST /api/reset-password` - Reset password

### Admin Endpoints
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/donations` - Donation analytics
- `GET /api/admin/analytics/posts` - Post/comment analytics
- `POST /api/admin/give-warning` - Issue warning to user
- `POST /api/admin/suspend-user` - Suspend user account
- `GET /api/admin/recent-activity` - Recent activity feed

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/posts` - Get community posts
- `POST /api/posts` - Create new post

*(Full API documentation coming soon)*

---

## 👥 Team Collaboration

We use GitHub for collaboration. Please read **[CONTRIBUTING.md](./CONTRIBUTING.md)** for:
- Development setup
- Code standards
- Git workflow
- Pull request process
- Testing guidelines

### Quick Start for Team Members

1. **Clone** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** and commit frequently
4. **Push** and create a Pull Request on GitHub
5. **Request review** from team members
6. **Merge** after approval

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributors

- **Your Team Members** - 
- T.W.M.W.J.S.S. Tennakoon     - UOG0723010	
- Omalja Ranasinghe  - UOG0723009
- R. M. Isuri Nethmini	- UOG0723006
- Shenupa Betheni  - UOG0723004
- E.M.Manasha Nethmi sathruwani Ekanayake - UOG0422020
**LNBTI students**

---

## 📞 Support

If you encounter any issues:
1. Check existing [GitHub Issues](https://github.com/your-org/HerCycle/issues)
2. Create a new issue with details
3. Contact the team via [your communication channel]

---

## 🎯 Roadmap

- [ ] Implement WebSocket for real-time notifications
- [ ] Add unit and integration tests
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] AI-powered health insights

---

**Built with 💜 by the HerCycle Team - Group-09**
