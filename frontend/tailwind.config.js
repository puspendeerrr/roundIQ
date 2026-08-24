/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#C2410C',
          hover: '#9A3412',
          dark: '#18181B',
          bg: '#FFFFFF',
          surface: '#F8FAFC',
          border: '#E4E4E7',
          secondary: '#71717A',
          success: '#16A34A',
          error: '#DC2626',
        },
      },
    },
  },
  plugins: [],
};
