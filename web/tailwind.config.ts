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
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/screens/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: baseColor,
      backgroundColor: { ...BACKGROUND_COLORS, ...baseColor }, // bg
      textColor: { ...TYPOGRAPHY_COLORS, ...baseColor }, // text
      borderColor: { ...BORDER_COLORS, ...baseColor }, // border
      divideColor: { ...DIVIDER_COLORS, ...baseColor }, // divide

      fontFamily: {
        primary: ['sans-serif'],
      },

      fontSize: TYPOGRAPHY_VARIANTS,
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
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
  ],
};
export default config;
