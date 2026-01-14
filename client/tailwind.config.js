/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#ffd6e7',
                    dark: '#1a1a2e'
                },
                secondary: {
                    light: '#c2b0ff',
                    dark: '#16213e'
                }
            },
            backgroundImage: {
                'light-gradient': 'linear-gradient(135deg, #ffd6e7 0%, #c2b0ff 100%)',
                'dark-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            }
        },
    },
    plugins: [],
}
