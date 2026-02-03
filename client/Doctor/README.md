# HerCycle - Doctor Dashboard

A comprehensive dashboard for doctors to manage and publish educational articles about period health and sex education.

> **Quick Start:** New to the project? Check out [QUICKSTART.md](./QUICKSTART.md) for easy setup instructions!

## Features

### Dashboard Overview
- View statistics: total articles, views, comments, and likes
- Track published and draft articles
- Quick action buttons for creating and managing articles
- Engagement metrics visualization

### Article Management
- Create, edit, and delete articles
- Rich text editor for article content
- Multiple category support
- Tag management
- Draft and publish functionality
- Article status filtering (All, Published, Drafts)
- Featured images support

### Category Management
- Create and manage article categories
- Custom category colors
- Category descriptions
- Visual category organization

### Profile Settings
- Update personal information
- Manage professional details (specialization, qualifications, experience)
- Add bio and contact information
- Clinic address management

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- express-validator for input validation

### Frontend
- React 18
- Vite (build tool)
- Tailwind CSS
- React Router v6
- React Quill (rich text editor)
- React Icons
- Axios for API calls

## Project Structure

```
Doctor/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Doctor.js             # Doctor profile model
│   │   ├── Article.js            # Article model
│   │   └── Category.js           # Category model
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── articles.js           # Article CRUD routes
│   │   ├── categories.js         # Category CRUD routes
│   │   └── doctors.js            # Doctor profile routes
│   ├── middleware/
│   │   └── auth.js               # JWT auth middleware
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard/
    │   │   │   ├── DashboardHome.jsx
    │   │   │   ├── MyArticles.jsx
    │   │   │   ├── CreateArticle.jsx
    │   │   │   ├── ArticleCategories.jsx
    │   │   │   └── ProfileSettings.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Navbar.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── DoctorDashboard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Quick Start (Run Everything Together)

1. Install all dependencies (backend + frontend + root):
```bash
npm run install-all
```

2. Configure environment variables:
   - Open `backend/.env` file
   - Update `MONGODB_URI` with your MongoDB connection string
   - Change `JWT_SECRET` to a secure random string

3. Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod
```

4. Run both backend and frontend together:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend server on `http://localhost:3000`

### Alternative: Run Separately

If you prefer to run backend and frontend in separate terminals:

**Backend:**
```bash
npm run server
```

**Frontend (in a new terminal):**
```bash
npm run client
```

### MongoDB Setup

If using MongoDB locally:
```bash
# Start MongoDB service
mongod
```

If using MongoDB Atlas:
1. Create a cluster at mongodb.com
2. Get the connection string
3. Update `MONGODB_URI` in `backend/.env`

## Usage

### Registration
1. Navigate to `http://localhost:3000/register`
2. Fill in your details:
   - Full name
   - Email
   - Password
   - Specialization (e.g., Gynecologist)
   - Qualifications (e.g., MBBS, MD)
   - Years of experience
   - Bio (optional)
   - Contact number (optional)
3. Click "Register"

### Login
1. Navigate to `http://localhost:3000/login`
2. Enter your email and password
3. Click "Login"

### Creating Articles
1. From the dashboard, click "Create Article" or navigate to the Create page
2. Fill in:
   - Title
   - Excerpt (short summary)
   - Content (using the rich text editor)
   - Featured image URL (optional)
   - Select categories
   - Add tags (comma-separated)
3. Click "Save as Draft" or "Publish Article"

### Managing Categories
1. Navigate to Categories page
2. Click "Add Category"
3. Fill in:
   - Category name
   - Description
   - Choose a color
4. Click "Create"

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new doctor
- `POST /api/auth/login` - Login

### Articles
- `GET /api/articles` - Get all articles by current doctor
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Doctor Profile
- `GET /api/doctors/profile` - Get doctor profile
- `PUT /api/doctors/profile` - Update doctor profile
- `GET /api/doctors/stats` - Get dashboard statistics

## Default Categories

Consider creating these categories:
- Period Health
- Sex Education
- Reproductive Health
- Menstrual Hygiene
- Pregnancy & Fertility
- Hormonal Health
- Mental Wellness
- Nutrition & Diet

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes (doctor-only access)
- Input validation with express-validator
- CORS enabled

## Future Enhancements

- Image upload functionality
- Article analytics and insights
- Comment moderation
- User feedback system
- Email notifications
- Search functionality
- Article scheduling
- Multi-language support

## Contributing

This is a group project for HerCycle. For any issues or suggestions, please contact the development team.

## License

MIT

## Support

For questions or support, please contact the HerCycle development team.
