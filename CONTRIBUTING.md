# Contributing to HerCycle

Welcome to the HerCycle project! This document provides guidelines for contributing to the codebase.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Git Workflow](#git-workflow)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **MongoDB** 6.x or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/downloads))

### Project Structure

```
HerCycle/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   └── App.jsx     # Main app component
│   └── package.json
│
├── server/          # Express backend
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── server.js       # Main server file
│   ├── setup.js        # Database setup
│   └── package.json
│
└── README.md
```

---

## 💻 Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/HerCycle.git
cd HerCycle
```

### 2. Install Dependencies

**Client:**
```bash
cd client
npm install
```

**Server:**
```bash
cd ../server
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server/` directory:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your configuration:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/hercycle

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email (Gmail)
EMAIL_USER=hercyle806@gmail.com
EMAIL_PASS=your-gmail-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here

# Server
PORT=5000
NODE_ENV=development
```

> **⚠️ IMPORTANT**: Never commit your `.env` file! It contains sensitive credentials.

### 4. Database Setup (Optional)

To seed the database with sample data:

```bash
cd server
node seed.js
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## 📝 Code Standards

### General Guidelines

- **Write clean, readable code** with meaningful variable and function names
- **Add comments** for complex logic or non-obvious implementations
- **Follow existing patterns** in the codebase for consistency
- **Keep functions small and focused** (single responsibility principle)
- **Avoid code duplication** - reuse existing utilities

### JavaScript/React

- Use **ES6+ syntax** (arrow functions, destructuring, async/await)
- Use **functional components** with hooks in React
- Follow **camelCase** for variables and functions
- Follow **PascalCase** for React components
- Use **const** by default, **let** only when reassignment is needed

### Code Formatting

- **Indentation**: 2 spaces (not tabs)
- **Semicolons**: Optional but be consistent
- **Quotes**: Single quotes `'` for strings (except JSX attributes)
- **Line length**: Keep lines under 100 characters when possible

### Comments

Add JSDoc comments for functions:

```javascript
/**
 * Suspends a user account for specified duration
 * @param {string} user_nic - User's National ID
 * @param {string} duration - Suspension duration (1week, 1month, 3months)
 * @returns {Promise<Object>} Updated user object
 */
async function suspendUser(user_nic, duration) {
  // Implementation
}
```

---

## 🔄 Git Workflow

### Branch Naming Convention

Format: `type/short-description`

**Types:**
- `feature/` - New features
- `fix/` - Bug fixes  
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `style/` - CSS/UI changes

**Examples:**
```bash
feature/doctor-verification
fix/login-validation-error
refactor/admin-routes
docs/api-documentation
```

### Commit Message Format

```
type: Brief description (50 chars or less)

Detailed explanation if needed (wrap at 72 chars).
Include motivation for change and contrast with previous behavior.

- Bullet points are okay
- Use present tense ("Add feature" not "Added feature")
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `style:` - Formatting, CSS
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: Add email notifications for warnings
fix: Resolve textarea visibility issue in warning modal
refactor: Split server.js into modular route files
docs: Update README with setup instructions
```

### Workflow Steps

1. **Create a branch** from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit frequently:
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

3. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub:
   - Write a clear title and description
   - Reference any related issues
   - Request reviews from team members

5. **Address review feedback** and update PR:
   ```bash
   git add .
   git commit -m "fix: Address review comments"
   git push origin feature/your-feature-name
   ```

6. **Merge** once approved (squash merge preferred)

---

## 🧪 Testing

Before submitting a pull request:

### Manual Testing Checklist

- [ ] Test your changes in the browser
- [ ] Check responsive design (mobile, tablet, desktop)
- [ ] Verify API endpoints work as expected
- [ ] Test error handling and edge cases
- [ ] Ensure no console errors or warnings
- [ ] Check network tab for failed requests

### Build Test

**Client:**
```bash
cd client
npm run build
# Ensure build succeeds with no errors
```

**Server:**
```bash
cd server
npm start
# Ensure server starts without errors
```

---

## 📤 Pull Request Process

### Before Creating PR

1. **Update your branch** with latest main:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git merge main
   # Resolve any conflicts
   ```

2. **Run the project** and test thoroughly

3. **Check for sensitive data** - No passwords, API keys, or tokens in code

### PR Template

When creating a PR, include:

```markdown
## Description
Brief summary of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Refactoring
- [ ] Documentation

## Testing Done
- [ ] Tested locally
- [ ] Build succeeds
- [ ] No console errors

## Screenshots (if applicable)
[Add screenshots of UI changes]

## Related Issues
Fixes #123
```

### Review Process

- At least **1 team member** must review
- Address all comments before merging
- Resolve all conversations
- Ensure CI checks pass (if configured)

---

## 🤝 Team Communication

- **Ask questions** in team chat before making major architectural changes
- **Document decisions** in PR descriptions or code comments  
- **Help team members** with reviews and feedback
- **Share knowledge** - if you learn something useful, share it!

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Git Best Practices](https://www.git-scm.com/book/en/v2)

---

## ❓ Questions?

If you have questions or need help:
1. Check existing documentation
2. Search closed issues/PRs for similar problems
3. Ask in team chat
4. Create a GitHub issue for bugs or feature requests

---

**Thank you for contributing to HerCycle! 💜**
