/** @type {import('tailwindcss').Config} */
export default {
    content: ['./shopkeeper/web/frontend/index.html', './shopkeeper/web/frontend/src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {},
        fontFamily: {
            sans: ['Inter Variable', 'sans-serif'],
        },
    },
    plugins: [require('@tailwindcss/typography')],
};