/**
 * 🎨 Kobweb Design System - Design Tokens
 *
 * 코드베이스에서 자동 추출된 모든 색상과 스타일 정보
 * Figma로 이전할 때 참조용으로 사용
 */

export const designTokens = {
  // 💎 COLOR PALETTE
  colors: {
    // Primary Colors (주요 색상)
    primary: {
      main: '#1E2022',        // 메인 다크 그레이 (헤더, 버튼)
      light: '#34373b',       // 밝은 다크 그레이 (hover, accent)
      dark: '#000000'         // 완전 검정 (텍스트 강조)
    },

    // Background Colors (배경 색상)
    background: {
      main: '#F0F5F9',        // 메인 배경 (연한 블루그레이)
      surface: '#e1e4e6',     // 카드 배경 (중간 그레이)
      sidebar: '#C9D6DF',     // 사이드바 배경 (청회색)
      white: '#FFFFFF'        // 순백색
    },

    // Text Colors (텍스트 색상)
    text: {
      primary: '#1E2022',     // 주요 텍스트
      secondary: '#52616B',   // 보조 텍스트
      tertiary: '#788189',    // 비활성 텍스트
      inverse: '#F0F5F9'      // 반전 텍스트 (다크 배경용)
    },

    // Border Colors (테두리 색상)
    border: {
      main: '#bfc7d1',        // 메인 테두리
      light: '#E1E4E6',       // 연한 테두리
      dark: '#C9D6DF'         // 진한 테두리
    },

    // Status Colors (상태 색상)
    status: {
      success: {
        background: '#d1fae5',
        text: '#065f46',
        border: '#a7f3d0'
      },
      error: {
        background: '#fee2e2',
        text: '#dc2626',
        border: '#fecaca'
      },
      info: {
        background: '#4F80FF',
        hover: '#3a6bff'
      }
    },

    // Social & Brand Colors (소셜/브랜드 색상)
    social: {
      google: '#dc4e41',
      github: '#24292e',
      red: '#ef4444'
    }
  },

  // 📏 SPACING SYSTEM
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    '4xl': '3rem',    // 48px
    '5xl': '4rem',    // 64px
    '6xl': '5rem'     // 80px
  },

  // 📝 TYPOGRAPHY
  typography: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
      display: ['Pacifico', 'cursive']
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // 🎯 BORDER RADIUS
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px'
  },

  // 🌫️ SHADOWS
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  },

  // 🎭 TRANSITIONS
  transition: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms'
    },
    timing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
    }
  }
};

// 🧩 COMPONENT VARIANTS
export const componentVariants = {
  button: {
    primary: {
      backgroundColor: designTokens.colors.primary.main,
      color: designTokens.colors.text.inverse,
      '&:hover': {
        backgroundColor: designTokens.colors.primary.light
      }
    },
    secondary: {
      backgroundColor: designTokens.colors.background.surface,
      color: designTokens.colors.text.primary,
      border: `1px solid ${designTokens.colors.border.main}`,
      '&:hover': {
        backgroundColor: designTokens.colors.border.dark
      }
    },
    outline: {
      backgroundColor: 'transparent',
      color: designTokens.colors.text.primary,
      border: `1px solid ${designTokens.colors.border.main}`,
      '&:hover': {
        backgroundColor: designTokens.colors.background.surface
      }
    }
  },

  card: {
    default: {
      backgroundColor: designTokens.colors.background.white,
      border: `1px solid ${designTokens.colors.border.light}`,
      borderRadius: designTokens.borderRadius.lg,
      boxShadow: designTokens.boxShadow.sm
    },
    elevated: {
      backgroundColor: designTokens.colors.background.surface,
      borderRadius: designTokens.borderRadius['2xl'],
      boxShadow: designTokens.boxShadow.lg
    }
  },

  input: {
    default: {
      backgroundColor: designTokens.colors.background.main,
      border: `1px solid ${designTokens.colors.border.main}`,
      borderRadius: designTokens.borderRadius.lg,
      color: designTokens.colors.text.primary,
      '&:focus': {
        borderColor: designTokens.colors.primary.light,
        outline: 'none',
        boxShadow: `0 0 0 2px ${designTokens.colors.primary.light}20`
      }
    }
  }
};

// 📱 RESPONSIVE BREAKPOINTS
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// 🎨 CSS VARIABLES GENERATOR
export const generateCSSVariables = () => {
  const cssVars = {};

  // Colors
  Object.entries(designTokens.colors).forEach(([category, colors]) => {
    if (typeof colors === 'object') {
      Object.entries(colors).forEach(([name, value]) => {
        if (typeof value === 'string') {
          cssVars[`--color-${category}-${name}`] = value;
        } else if (typeof value === 'object') {
          Object.entries(value).forEach(([subName, subValue]) => {
            cssVars[`--color-${category}-${name}-${subName}`] = subValue;
          });
        }
      });
    } else {
      cssVars[`--color-${category}`] = colors;
    }
  });

  // Spacing
  Object.entries(designTokens.spacing).forEach(([name, value]) => {
    cssVars[`--spacing-${name}`] = value;
  });

  // Typography
  Object.entries(designTokens.typography.fontSize).forEach(([name, value]) => {
    cssVars[`--font-size-${name}`] = value;
  });

  return cssVars;
};

export default designTokens;