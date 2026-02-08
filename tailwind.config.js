const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Color Palette Overrides
        gray: colors.slate,    // Cool, bluish-gray (Modern/Tech feel)
        indigo: colors.violet, // Richer, more vibrant purple-blue
        emerald: colors.teal,  // Sophisticated blue-green
        red: colors.rose,      // Softer, elegant red
        // Keep existing if needed, but these overrides propagate to all bg-*, text-* classes
      }
    },
  },
  plugins: [],
}
