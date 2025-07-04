/**
 * Enhanced Color Palette System
 * A comprehensive, scalable color system for modern applications
 */

// ===== CORE COLORS =====
const WHITE = '#FFFFFF';
const BLACK = '#000000';

// ===== NEUTRAL GRAYS =====
const GRAY = {
  25: '#FDFDFD', // Almost white
  50: '#FAFAFA', // Very light gray
  100: '#F5F5F5', // Light gray
  200: '#E9EAEB', // Soft gray
  300: '#D5D7DA', // Medium light gray
  400: '#A4A7AE', // Medium gray
  500: '#717680', // Base gray
  600: '#535862', // Dark gray
  700: '#414651', // Darker gray
  800: '#252B37', // Very dark gray
  900: '#181D27', // Almost black
  base: '#D1D1D1', // Legacy support
  'base-light': '#EDEDED', // Legacy support
} as const;

// ===== BRAND COLORS =====
const BRAND = {
  25: '#FBFEFE', // Brand lightest
  50: '#E2F8F9', // Brand very light
  100: '#B7EEEF', // Brand light
  200: '#89E3E6', // Brand light medium
  300: '#5ED7DD', // Brand medium light
  400: '#44CED6', // Brand medium
  500: '#36C5D1', // Brand base
  600: '#33B5BE', // Brand medium dark
  700: '#2F9FA5', // Brand dark
  800: '#2B8B8E', // Brand darker
  900: '#246764', // Brand darkest
} as const;

// ===== SEMANTIC COLORS =====
const ERROR = {
  25: '#FFFBFA', // Error lightest
  50: '#FEF3F2', // Error very light
  100: '#FEE4E2', // Error light
  200: '#FECDCA', // Error light medium
  300: '#FDA29B', // Error medium light
  400: '#F97066', // Error medium
  500: '#F04438', // Error base
  600: '#D92D20', // Error medium dark
  700: '#B42318', // Error dark
  800: '#912018', // Error darker
  900: '#7A271A', // Error darkest
} as const;

const WARNING = {
  25: '#FFFCF5', // Warning lightest
  50: '#FFFAEB', // Warning very light
  100: '#FEF0C7', // Warning light
  200: '#FEDF89', // Warning light medium
  300: '#FEC84B', // Warning medium light
  400: '#FDB022', // Warning medium
  500: '#F79009', // Warning base
  600: '#DC6803', // Warning medium dark
  700: '#B54708', // Warning dark
  800: '#93370D', // Warning darker
  900: '#7A2E0E', // Warning darkest
} as const;

const SUCCESS = {
  25: '#F6FEF9', // Success lightest
  50: '#ECFDF3', // Success very light
  100: '#D1FADF', // Success light
  200: '#A6F4C5', // Success light medium
  300: '#6CE9A6', // Success medium light
  400: '#32D583', // Success medium
  500: '#12B76A', // Success base
  600: '#039855', // Success medium dark
  700: '#027A48', // Success dark
  800: '#05603A', // Success darker
  900: '#054F31', // Success darkest
} as const;

const INFO = {
  25: '#F5FBFF', // Info lightest
  50: '#F0F9FF', // Info very light
  100: '#E0F2FE', // Info light
  200: '#B9E6FE', // Info light medium
  300: '#7CD4FD', // Info medium light
  400: '#36BFFA', // Info medium
  500: '#0BA5EC', // Info base
  600: '#0086C9', // Info medium dark
  700: '#026AA2', // Info dark
  800: '#065986', // Info darker
  900: '#0B4A6F', // Info darkest
} as const;

// ===== EXTENDED BLUE PALETTE =====
const BLUE_GRAY = {
  25: '#FCFCFD', // Blue gray lightest
  50: '#F8F9FC', // Blue gray very light
  100: '#EAECF5', // Blue gray light
  200: '#D5D9EB', // Blue gray light medium
  300: '#AFB5D9', // Blue gray medium light
  400: '#717BBC', // Blue gray medium
  500: '#4E5BA6', // Blue gray base
  600: '#3E4784', // Blue gray medium dark
  700: '#363F72', // Blue gray dark
  800: '#293056', // Blue gray darker
  900: '#101323', // Blue gray darkest
} as const;

const BLUE_LIGHT = {
  25: '#F5FBFF', // Light blue lightest
  50: '#F0F9FF', // Light blue very light
  100: '#E0F2FE', // Light blue light
  200: '#B9E6FE', // Light blue light medium
  300: '#7CD4FD', // Light blue medium light
  400: '#36BFFA', // Light blue medium
  500: '#0BA5EC', // Light blue base
  600: '#0086C9', // Light blue medium dark
  700: '#026AA2', // Light blue dark
  800: '#065986', // Light blue darker
  900: '#0B4A6F', // Light blue darkest
} as const;

const BLUE = {
  25: '#F5FAFF', // Blue lightest
  50: '#EFF8FF', // Blue very light
  100: '#D1E9FF', // Blue light
  200: '#B2DDFF', // Blue light medium
  300: '#84CAFF', // Blue medium light
  400: '#53B1FD', // Blue medium
  500: '#2E90FA', // Blue base
  600: '#1570EF', // Blue medium dark
  700: '#175CD3', // Blue dark
  800: '#1849A9', // Blue darker
  900: '#194185', // Blue darkest
} as const;

// ===== VIBRANT COLORS =====
const INDIGO = {
  25: '#F5F8FF', // Indigo lightest
  50: '#EEF4FF', // Indigo very light
  100: '#E0EAFF', // Indigo light
  200: '#C7D7FE', // Indigo light medium
  300: '#A4BCFD', // Indigo medium light
  400: '#8098F9', // Indigo medium
  500: '#6172F3', // Indigo base
  600: '#444CE7', // Indigo medium dark
  700: '#3538CD', // Indigo dark
  800: '#2D31A6', // Indigo darker
  900: '#2D3282', // Indigo darkest
} as const;

const PURPLE = {
  25: '#FAFAFF', // Purple lightest
  50: '#F4F3FF', // Purple very light
  100: '#EBE9FE', // Purple light
  200: '#D9D6FE', // Purple light medium
  300: '#BDB4FE', // Purple medium light
  400: '#9B8AFB', // Purple medium
  500: '#7A5AF8', // Purple base
  600: '#6938EF', // Purple medium dark
  700: '#5925DC', // Purple dark
  800: '#4A1FB8', // Purple darker
  900: '#3E1C96', // Purple darkest
} as const;

const PINK = {
  25: '#FEF6FB', // Pink lightest
  50: '#FDF2FA', // Pink very light
  100: '#FCE7F6', // Pink light
  200: '#FCCEEE', // Pink light medium
  300: '#FAA7E0', // Pink medium light
  400: '#F670C7', // Pink medium
  500: '#EE46BC', // Pink base
  600: '#DD2590', // Pink medium dark
  700: '#C11574', // Pink dark
  800: '#9E165F', // Pink darker
  900: '#851651', // Pink darkest
} as const;

const ROSE = {
  25: '#FFF5F6', // Rose lightest
  50: '#FFF1F3', // Rose very light
  100: '#FFE4E8', // Rose light
  200: '#FECDD6', // Rose light medium
  300: '#FEA3B4', // Rose medium light
  400: '#FD6F8E', // Rose medium
  500: '#F63D68', // Rose base
  600: '#E31B54', // Rose medium dark
  700: '#C01048', // Rose dark
  800: '#A11043', // Rose darker
  900: '#89123E', // Rose darkest
} as const;

const ORANGE = {
  25: '#FFFAF5', // Orange lightest
  50: '#FFF6ED', // Orange very light
  100: '#FFEAD5', // Orange light
  200: '#FDDCAB', // Orange light medium
  300: '#FEB273', // Orange medium light
  400: '#FD853A', // Orange medium
  500: '#FB6514', // Orange base
  600: '#EC4A0A', // Orange medium dark
  700: '#C4320A', // Orange dark
  800: '#9C2A10', // Orange darker
  900: '#7E2410', // Orange darkest
} as const;

// ===== ADDITIONAL COLORS =====
const TEAL = {
  25: '#F6FEFC', // Teal lightest
  50: '#F0FDF9', // Teal very light
  100: '#CCFBEF', // Teal light
  200: '#99F6E4', // Teal light medium
  300: '#5EEAD4', // Teal medium light
  400: '#2DD4BF', // Teal medium
  500: '#14B8A6', // Teal base
  600: '#0F766E', // Teal medium dark
  700: '#0D5D56', // Teal dark
  800: '#134E4A', // Teal darker
  900: '#134E4A', // Teal darkest
} as const;

const CYAN = {
  25: '#F0FDFF', // Cyan lightest
  50: '#ECFEFF', // Cyan very light
  100: '#CFFAFE', // Cyan light
  200: '#A5F3FC', // Cyan light medium
  300: '#67E8F9', // Cyan medium light
  400: '#22D3EE', // Cyan medium
  500: '#06B6D4', // Cyan base
  600: '#0891B2', // Cyan medium dark
  700: '#0E7490', // Cyan dark
  800: '#155E75', // Cyan darker
  900: '#164E63', // Cyan darkest
} as const;

const EMERALD = {
  25: '#F0FDF4', // Emerald lightest
  50: '#ECFDF5', // Emerald very light
  100: '#D1FAE5', // Emerald light
  200: '#A7F3D0', // Emerald light medium
  300: '#6EE7B7', // Emerald medium light
  400: '#34D399', // Emerald medium
  500: '#10B981', // Emerald base
  600: '#059669', // Emerald medium dark
  700: '#047857', // Emerald dark
  800: '#065F46', // Emerald darker
  900: '#064E3B', // Emerald darkest
} as const;

// ===== PALETTE COLLECTIONS =====
export const PALETTES = {
  // Core
  white: WHITE,
  black: BLACK,
  gray: GRAY,

  // Brand
  brand: BRAND,

  // Semantic
  error: ERROR,
  warning: WARNING,
  success: SUCCESS,
  info: INFO,

  // Blues
  blueGray: BLUE_GRAY,
  blueLight: BLUE_LIGHT,
  blue: BLUE,

  // Vibrant
  indigo: INDIGO,
  purple: PURPLE,
  pink: PINK,
  rose: ROSE,
  orange: ORANGE,

  // Nature
  teal: TEAL,
  cyan: CYAN,
  emerald: EMERALD,
} as const;

// ===== SEMANTIC ALIASES =====
export const SEMANTIC_COLORS = {
  primary: BRAND,
  secondary: GRAY,
  danger: ERROR,
  warning: WARNING,
  success: SUCCESS,
  info: INFO,
} as const;

// ===== UTILITY FUNCTIONS =====
export const getColorWithOpacity = (color: string, opacity: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getContrastColor = (backgroundColor: string): string => {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? BLACK : WHITE;
};

// ===== THEME PRESETS =====
export const LIGHT_THEME = {
  background: WHITE,
  surface: GRAY[25],
  primary: BRAND[500],
  secondary: GRAY[500],
  text: {
    primary: GRAY[900],
    secondary: GRAY[600],
    disabled: GRAY[400],
  },
  border: GRAY[200],
  shadow: getColorWithOpacity(BLACK, 0.1),
} as const;

export const DARK_THEME = {
  background: GRAY[900],
  surface: GRAY[800],
  primary: BRAND[400],
  secondary: GRAY[400],
  text: {
    primary: WHITE,
    secondary: GRAY[300],
    disabled: GRAY[500],
  },
  border: GRAY[700],
  shadow: getColorWithOpacity(BLACK, 0.3),
} as const;

// ===== EXPORT ALL =====
export {
  BLACK,
  BLUE,
  // Extended blues
  BLUE_GRAY,
  BLUE_LIGHT,
  // Brand
  BRAND,
  CYAN,
  EMERALD,
  // Semantic
  ERROR,
  GRAY,
  // Vibrant colors
  INDIGO,
  INFO,
  ORANGE,
  PINK,
  PURPLE,
  ROSE,
  SUCCESS,
  // Nature colors
  TEAL,
  WARNING,
  // Core colors
  WHITE,
};

// ===== TYPE DEFINITIONS =====
export type ColorScale = typeof GRAY;
export type ColorValue = string;
export type PaletteKey = keyof typeof PALETTES;
export type SemanticKey = keyof typeof SEMANTIC_COLORS;
