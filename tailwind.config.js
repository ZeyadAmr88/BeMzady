/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: {
                    50: '#FFF9E5',
                    100: '#FFF2CC',
                    200: '#FFE699',
                    300: '#FFD966',
                    400: '#FFCD33',
                    500: '#FFC000', // Primary gold
                    600: '#CC9A00',
                    700: '#997300',
                    800: '#664D00',
                    900: '#332600',
                },
                navy: {
                    50: '#E6E8F0',
                    100: '#C4C9E0',
                    200: '#A2AAD0',
                    300: '#808BC0',
                    400: '#5E6CB0',
                    500: '#3C4DA0', // Primary navy
                    600: '#303D80',
                    700: '#242E60',
                    800: '#181E40',
                    900: '#0C0F20',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
} 