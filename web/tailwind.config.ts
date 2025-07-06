/** @type {import('tailwindcss').Config} */

import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import type { PluginAPI } from 'tailwindcss/types/config';

import {
  BACKGROUND_COLORS,
  BORDER_COLORS,
  COMPONENT_COLORS,
  DIVIDER_COLORS,
  TYPOGRAPHY_COLORS,
} from './theme/colors';
import { PALETTES } from './theme/palettes';
import { TYPOGRAPHY_VARIANTS } from './theme/typography';

const baseColor = { ...PALETTES, ...COMPONENT_COLORS };

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/screens/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      backgroundColor: {
        ...BACKGROUND_COLORS,
        ...baseColor,
      },
      textColor: {
        ...TYPOGRAPHY_COLORS,
        ...baseColor,
      },
      borderColor: {
        ...BORDER_COLORS,
        ...baseColor,
      },
      divideColor: {
        ...DIVIDER_COLORS,
        ...baseColor,
      },
      fontFamily: {
        primary: ['Noto Sans Thai', 'sans-serif'],
      },
      fontSize: TYPOGRAPHY_VARIANTS,
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    plugin(({ addComponents }: PluginAPI) => {
      addComponents({
        '.bg-loading-container': {
          backgroundColor: '#f5f5f5',
          backgroundImage:
            'linear-gradient(90deg, rgba(240, 240, 240, 1) 33%, rgba(220, 220, 220, 0.8) 66%, rgba(240, 240, 240, 1) 100%)',
          backgroundSize: '200% 100%',
          backgroundPosition: '200% 0',
          animation: 'shimmer 3s ease-out infinite',
          borderRadius: '8px',
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        '.bg-loading-surface-container': {
          backgroundColor: '#e0dee4',
          backgroundImage:
            'linear-gradient(90deg, rgba(224, 222, 228, 1) 33%, rgba(208, 206, 214, 0.8) 66%, rgba(224, 222, 228, 1) 100%)',
          backgroundSize: '200% 100%',
          backgroundPosition: '200% 0',
          animation: 'shimmer-surface 3s ease-out infinite',
          borderRadius: '8px',
        },
        '@keyframes shimmer-surface': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      });
    }),
    require('tailwindcss-animate'),
  ],
};
export default config;
