# HerCycle - React Template

A modern, beautiful React template for period tracking and community features built with **Vite + React + Tailwind CSS v4**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Header.jsx       # Navigation bar with dark mode toggle
│   ├── Hero.jsx         # Hero/landing section
│   ├── Features.jsx     # Feature cards section
│   ├── Community.jsx    # Posts management
│   ├── PostCard.jsx     # Individual post component
│   ├── NewPostForm.jsx  # Create new post form
│   ├── CommentSection.jsx # Comments for posts
│   ├── About.jsx        # About section
│   ├── Footer.jsx       # Footer with links
│   └── DarkModeToggle.jsx # Dark/Light mode switcher
├── App.jsx              # Main app component
├── main.jsx             # React entry point
└── index.css            # Tailwind + custom styles
```

## 🎨 Design System

### Colors
The app uses a **pink-purple gradient** theme:
- **Primary Light**: `#ffd6e7` (soft pink)
- **Secondary Light**: `#c2b0ff` (soft purple)
- **Primary Dark**: `#1a1a2e` (deep navy)
- **Secondary Dark**: `#16213e` (dark purple)

### Utility Classes
```css
/* Glassmorphism cards */
.glass-card

/* Gradient text */
.gradient-text

/* Primary button (pink-purple gradient) */
.btn-primary

/* Secondary button (outlined) */
.btn-secondary

/* Post card with hover effect */
.post-card

/* Background gradients */
.bg-light-gradient
.bg-dark-gradient

/* Pattern backgrounds */
.pattern-bg-light
.pattern-bg-dark
```

## 🌙 Dark Mode

Dark mode is fully supported and persists in `localStorage`. The toggle is in the header.

To add dark mode styles to your components, use Tailwind's `dark:` prefix:
```jsx
<div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
  Content here
</div>
```

## 📝 Adding New Components

1. Create your component in `src/components/`
2. Import it in `App.jsx`
3. Add it to the render tree

Example:
```jsx
// src/components/MySection.jsx
function MySection() {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        My Section
      </h2>
      {/* Your content */}
    </section>
  );
}
export default MySection;
```

## 🔧 Customization

### Changing Colors
Edit `src/index.css` and modify the `@theme` section:
```css
@theme {
  --color-pink-500: #your-color;
  /* ... */
}
```

### Adding New Pages
For multi-page apps, install React Router:
```bash
npm install react-router-dom
```

## 📦 Dependencies

- **React 18+** - UI library
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Font Awesome** - Icons (via CDN)

## 👥 For Teammates

1. Clone this repo
2. Run `npm install`
3. Run `npm run dev`
4. Start building your features in `src/components/`
5. Follow the existing component patterns for consistency

## 📄 License

MIT License - Feel free to use for any project!


## Api

/api/landing-page for landing page data


## Test credentials 

👤 User: test@test.com / test123
👑 Admin: admin@hercycle.com / admin123