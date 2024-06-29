/** @type {import('tailwindcss').Config} */
export default {
    content: ['./frontend/index.html', './frontend/src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {},
        fontFamily: {
            sans: ['Inter Variable', 'sans-serif'],
        },
    },
    plugins: [require('@tailwindcss/typography')],
};
