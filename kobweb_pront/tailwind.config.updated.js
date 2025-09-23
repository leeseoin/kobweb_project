/** @type {import('tailwindcss').Config} */
const { designTokens } = require('./design-system/tokens.js');

module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // 📝 Typography
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        pacifico: ['var(--font-pacifico)', 'cursive'],
      },

      // 🎨 Colors (from design tokens)
      colors: {
        // Primary colors
        primary: {
          main: designTokens.colors.primary.main,      // #1E2022
          light: designTokens.colors.primary.light,    // #34373b
          dark: designTokens.colors.primary.dark,      // #000000
        },

        // Background colors
        background: {
          main: designTokens.colors.background.main,       // #F0F5F9
          surface: designTokens.colors.background.surface, // #e1e4e6
          sidebar: designTokens.colors.background.sidebar, // #C9D6DF
        },

        // Text colors
        text: {
          primary: designTokens.colors.text.primary,     // #1E2022
          secondary: designTokens.colors.text.secondary, // #52616B
          tertiary: designTokens.colors.text.tertiary,   // #788189
          inverse: designTokens.colors.text.inverse,     // #F0F5F9
        },

        // Border colors
        border: {
          main: designTokens.colors.border.main,   // #bfc7d1
          light: designTokens.colors.border.light, // #E1E4E6
          dark: designTokens.colors.border.dark,   // #C9D6DF
        },

        // Status colors
        success: designTokens.colors.status.success,
        error: designTokens.colors.status.error,
        info: designTokens.colors.status.info,

        // Legacy color shortcuts (기존 코드 호환성)
        'primary-main': designTokens.colors.primary.main,
        'primary-light': designTokens.colors.primary.light,
        'bg-main': designTokens.colors.background.main,
        'bg-surface': designTokens.colors.background.surface,
        'bg-sidebar': designTokens.colors.background.sidebar,
      },

      // 📏 Spacing (extended)
      spacing: designTokens.spacing,

      // 🎯 Border Radius
      borderRadius: designTokens.borderRadius,

      // 🌫️ Box Shadow
      boxShadow: designTokens.boxShadow,

      // 🎭 Transitions
      transitionDuration: designTokens.transition.duration,
      transitionTimingFunction: designTokens.transition.timing,
    },
  },
  plugins: [],
};