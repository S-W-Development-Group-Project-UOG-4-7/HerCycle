/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          pink: '#FF69B4',
          purple: '#9B59B6',
        },
        accent: {
          teal: '#1ABC9C',
          orange: '#F39C12',
        },
        success: '#2ECC71',
        background: '#F8F9FA',
        text: {
          primary: '#2C3E50',
          secondary: '#7F8C8D',
        },
      },
      fontFamily: {
        header: ['Quicksand', 'Poppins', 'sans-serif'],
        body: ['Nunito', 'Open Sans', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
      },
    },
  },
  plugins: [],
}
