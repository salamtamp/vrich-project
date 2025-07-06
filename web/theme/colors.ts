import { BLUE_LIGHT, PALETTES } from './palettes';

const { gray, brand, success, error, warning, info, blueGray, blue, indigo, purple, teal } = PALETTES;
// emerald

// ===== TYPOGRAPHY COLORS =====
export const TYPOGRAPHY_COLORS = {
  // Primary text hierarchy
  primary: gray[900],
  secondary: gray[600],
  tertiary: gray[500],
  disabled: gray[300],
  placeholder: gray[400],

  // Interactive text
  link: brand[600],
  'link-hover': brand[700],
  'link-active': brand[800],
  'link-visited': brand[500],

  // Semantic colors
  success: success[600],
  'success-light': success[500],
  error: error[600],
  'error-light': error[500],
  warning: warning[600],
  'warning-light': warning[500],
  info: info[600],
  'info-light': info[500],

  // Inverse colors (for dark backgrounds)
  inverse: gray[50],
  'inverse-secondary': gray[200],
  'inverse-tertiary': gray[300],
  'inverse-disabled': gray[500],

  // Brand text
  brand: brand[600],
  'brand-light': brand[500],
  'brand-dark': brand[700],

  // Special purpose
  code: indigo[600],
  'code-background': indigo[50],
  accent: purple[600],
  muted: gray[400],
} as const;

// ===== BACKGROUND COLORS =====
export const BACKGROUND_COLORS = {
  // Base backgrounds
  base: gray[25],
  muted: gray[50],
  subtle: gray[100],

  // Surface levels
  'surface-primary': BLUE_LIGHT[50],
  'surface-secondary': BLUE_LIGHT[100],
  'surface-tertiary': BLUE_LIGHT[200],
  'surface-quaternary': BLUE_LIGHT[300],

  // Contrast surfaces
  'surface-contrast': blueGray[900],
  'surface-muted': blueGray[50],
  'surface-elevated': '#FFFFFF',

  // Semantic backgrounds
  'success-subtle': success[25],
  'success-muted': success[50],
  'error-subtle': error[25],
  'error-muted': error[50],
  'warning-subtle': warning[25],
  'warning-muted': warning[50],
  'info-subtle': info[25],
  'info-muted': info[50],

  // Brand backgrounds
  'brand-subtle': brand[25],
  'brand-muted': brand[50],
  'brand-light': brand[100],

  // Interactive states
  hover: gray[50],
  active: gray[100],
  selected: brand[50],
  focus: brand[25],

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  'overlay-light': 'rgba(0, 0, 0, 0.25)',
  'overlay-heavy': 'rgba(0, 0, 0, 0.75)',

  // Legacy support
  inverse: blueGray[100],
  highlight: blueGray[100],
  'base-gray': gray.base,
  'base-gray-light': gray['base-light'],
} as const;

// ===== BUTTON COLORS =====
export const BUTTON_COLORS = {
  // Primary button
  'button-primary-background': brand[600],
  'button-primary-foreground': gray[25],
  'button-primary-hover': brand[700],
  'button-primary-active': brand[800],
  'button-primary-disabled': brand[200],
  'button-primary-focus': brand[500],

  // Secondary button
  'button-secondary-background': gray[100],
  'button-secondary-foreground': brand[600],
  'button-secondary-hover': gray[200],
  'button-secondary-active': gray[300],
  'button-secondary-disabled': gray[50],
  'button-secondary-focus': gray[200],

  // Tertiary button
  'button-tertiary-background': 'transparent',
  'button-tertiary-foreground': brand[600],
  'button-tertiary-hover': brand[50],
  'button-tertiary-active': brand[100],
  'button-tertiary-disabled': 'transparent',
  'button-tertiary-focus': brand[25],

  // Destructive button
  'button-destructive-background': error[600],
  'button-destructive-foreground': gray[25],
  'button-destructive-hover': error[700],
  'button-destructive-active': error[800],
  'button-destructive-disabled': error[200],
  'button-destructive-focus': error[500],

  // Success button
  'button-success-background': success[600],
  'button-success-foreground': gray[25],
  'button-success-hover': success[700],
  'button-success-active': success[800],
  'button-success-disabled': success[200],
  'button-success-focus': success[500],

  // Ghost button
  'button-ghost-background': 'transparent',
  'button-ghost-foreground': gray[700],
  'button-ghost-hover': gray[50],
  'button-ghost-active': gray[100],
  'button-ghost-disabled': 'transparent',
  'button-ghost-focus': gray[25],

  // Disabled state (global)
  'button-disabled-background': gray[50],
  'button-disabled-foreground': gray[400],
} as const;

// ===== COMPONENT COLORS =====
export const COMPONENT_COLORS = {
  ...BUTTON_COLORS,

  // Input components
  'input-background': gray[25],
  'input-foreground': gray[900],
  'input-border': gray[300],
  'input-border-hover': gray[400],
  'input-border-focus': brand[500],
  'input-border-error': error[500],
  'input-placeholder': gray[400],

  // Select components
  'select-background': gray[25],
  'select-foreground': gray[900],
  'select-border': gray[300],
  'select-border-hover': gray[400],
  'select-border-focus': brand[500],
  'select-option-hover': brand[50],
  'select-option-selected': brand[100],

  // Checkbox & Radio
  'checkbox-background': gray[25],
  'checkbox-border': gray[300],
  'checkbox-checked': brand[600],
  'checkbox-checked-hover': brand[700],
  'checkbox-indeterminate': brand[600],

  // Toggle/Switch
  'toggle-background': gray[200],
  'toggle-background-checked': brand[600],
  'toggle-thumb': gray[25],
  'toggle-thumb-checked': gray[25],

  // Badge components
  'badge-primary': brand[600],
  'badge-primary-text': gray[25],
  'badge-secondary': gray[100],
  'badge-secondary-text': gray[700],
  'badge-success': success[100],
  'badge-success-text': success[700],
  'badge-error': error[100],
  'badge-error-text': error[700],
  'badge-warning': warning[100],
  'badge-warning-text': warning[700],
  'badge-info': info[100],
  'badge-info-text': info[700],

  // Avatar components
  'avatar-background': gray[100],
  'avatar-foreground': gray[600],
  'avatar-border': gray[200],

  // Card components
  'card-background': gray[25],
  'card-border': gray[200],
  'card-shadow': 'rgba(0, 0, 0, 0.05)',

  // Modal components
  'modal-background': gray[25],
  'modal-overlay': 'rgba(0, 0, 0, 0.5)',
  'modal-border': gray[200],

  // Tooltip components
  'tooltip-background': gray[900],
  'tooltip-foreground': gray[25],
  'tooltip-border': gray[700],

  // Progress components
  'progress-background': gray[100],
  'progress-foreground': brand[600],
  'progress-text': gray[700],

  // Skeleton components
  'skeleton-background': gray[100],
  'skeleton-foreground': gray[200],
} as const;

// ===== DIVIDER COLORS =====
export const DIVIDER_COLORS = {
  light: gray[100],
  medium: gray[300],
  dark: gray[700],
  accent: brand[500],
  subtle: gray[50],
  contrast: gray[900],
  brand: brand[200],
  success: success[200],
  error: error[200],
  warning: warning[200],
  info: info[200],
} as const;

// ===== BORDER COLORS =====
export const BORDER_COLORS = {
  // Base borders
  default: gray[300],
  light: gray[100],
  medium: gray[200],
  dark: gray[700],
  subtle: gray[50],

  // Interactive borders
  hover: gray[400],
  focus: brand[500],
  active: brand[600],

  // Semantic borders
  success: success[300],
  error: error[300],
  warning: warning[300],
  info: info[300],

  // Brand borders
  brand: brand[300],
  'brand-light': brand[200],
  'brand-dark': brand[400],

  // Typography borders (legacy)
  'typography-primary': gray[900],
  'typography-secondary': gray[600],
  'typography-disabled': gray[300],
  'typography-link': brand[700],
  'typography-success': success[500],
  'typography-inverse': gray[50],
  'typography-error': error[700],
} as const;

// ===== ENHANCED CHART COLORS =====
export const CHART_COLORS = {
  // Primary palette (high contrast, accessible)
  primary: [
    brand[600], // Primary brand
    success[600], // Success green
    error[600], // Error red
    warning[600], // Warning orange
    info[600], // Info blue
    purple[600], // Purple
    teal[600], // Teal
    indigo[600], // Indigo
  ],

  // Extended palette for complex charts
  extended: [
    brand[600], // #36C5D1
    success[600], // #039855
    error[600], // #D92D20
    warning[600], // #DC6803
    info[600], // #0086C9
    purple[600], // #6938EF
    teal[600], // #0F766E
    indigo[600], // #444CE7
    brand[400], // Lighter brand
    success[400], // Lighter success
    error[400], // Lighter error
    warning[400], // Lighter warning
    info[400], // Lighter info
    purple[400], // Lighter purple
    teal[400], // Lighter teal
    indigo[400], // Lighter indigo
  ],

  // Sequential palettes for heatmaps, etc.
  sequential: {
    brand: [brand[100], brand[200], brand[300], brand[400], brand[500], brand[600], brand[700], brand[800]],
    blue: [blue[100], blue[200], blue[300], blue[400], blue[500], blue[600], blue[700], blue[800]],
    green: [
      success[100],
      success[200],
      success[300],
      success[400],
      success[500],
      success[600],
      success[700],
      success[800],
    ],
    red: [error[100], error[200], error[300], error[400], error[500], error[600], error[700], error[800]],
    purple: [
      purple[100],
      purple[200],
      purple[300],
      purple[400],
      purple[500],
      purple[600],
      purple[700],
      purple[800],
    ],
  },

  // Diverging palettes for data that has a meaningful center
  diverging: {
    'red-blue': [
      error[800],
      error[600],
      error[400],
      error[200],
      gray[100],
      info[200],
      info[400],
      info[600],
      info[800],
    ],
    'green-red': [
      success[800],
      success[600],
      success[400],
      success[200],
      gray[100],
      error[200],
      error[400],
      error[600],
      error[800],
    ],
    'purple-orange': [
      purple[800],
      purple[600],
      purple[400],
      purple[200],
      gray[100],
      warning[200],
      warning[400],
      warning[600],
      warning[800],
    ],
  },

  // Legacy support
  legacy: [
    '#2D99A3',
    '#E3C577',
    '#E76F51',
    '#A8DADC',
    '#457B9D',
    '#1B6773',
    '#62B6CB',
    '#C3A46C',
    '#F19C79',
    '#D95D39',
    '#89C2D9',
    '#2A4D69',
    '#F4D06F',
    '#763661',
    '#F2E9E4',
  ],
} as const;

// ===== THEME UTILITIES =====
export const THEME_UTILITIES = {
  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    heavy: 'rgba(0, 0, 0, 0.25)',
    brand: `rgba(${hexToRgb(brand[600])}, 0.25)`,
  },

  // Gradient backgrounds
  gradients: {
    brand: `linear-gradient(135deg, ${brand[400]} 0%, ${brand[600]} 100%)`,
    success: `linear-gradient(135deg, ${success[400]} 0%, ${success[600]} 100%)`,
    error: `linear-gradient(135deg, ${error[400]} 0%, ${error[600]} 100%)`,
    warning: `linear-gradient(135deg, ${warning[400]} 0%, ${warning[600]} 100%)`,
    info: `linear-gradient(135deg, ${info[400]} 0%, ${info[600]} 100%)`,
    subtle: `linear-gradient(135deg, ${gray[50]} 0%, ${gray[100]} 100%)`,
    vibrant: `linear-gradient(135deg, ${brand[500]} 0%, ${purple[500]} 50%, ${indigo[500]} 100%)`,
  },

  // Focus ring colors
  focusRing: {
    brand: `0 0 0 2px ${brand[500]}`,
    success: `0 0 0 2px ${success[500]}`,
    error: `0 0 0 2px ${error[500]}`,
    warning: `0 0 0 2px ${warning[500]}`,
    info: `0 0 0 2px ${info[500]}`,
  },
} as const;

// ===== UTILITY FUNCTIONS =====
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}

// ===== EXPORTS =====
export {
  // Legacy exports for backwards compatibility
  CHART_COLORS as CHART_COLOR,
};

// ===== TYPE DEFINITIONS =====
// export type TypographyVariant = keyof typeof TYPOGRAPHY_VARIANTS;
export type TypographyColor = keyof typeof TYPOGRAPHY_COLORS;
export type BackgroundColor = keyof typeof BACKGROUND_COLORS;
export type ButtonColor = keyof typeof BUTTON_COLORS;
export type ComponentColor = keyof typeof COMPONENT_COLORS;
export type DividerColor = keyof typeof DIVIDER_COLORS;
export type BorderColor = keyof typeof BORDER_COLORS;
export type ChartColorPalette = keyof typeof CHART_COLORS;
