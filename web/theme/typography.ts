import type { TailwindTypographyConfig } from '@/types/tailwind';

// ===== TYPOGRAPHY SCALE =====
export const TYPOGRAPHY_VARIANTS: TailwindTypographyConfig = {
  // Micro Text
  'xxs-regular': ['10px', { lineHeight: '14px', fontWeight: '400', letterSpacing: '0.01em' }],
  'xxs-medium': ['10px', { lineHeight: '14px', fontWeight: '500', letterSpacing: '0.01em' }],
  'xxs-semibold': ['10px', { lineHeight: '14px', fontWeight: '600', letterSpacing: '0.01em' }],
  'xxs-bold': ['10px', { lineHeight: '14px', fontWeight: '700', letterSpacing: '0.01em' }],

  // Extra Small
  'xs-regular': ['12px', { lineHeight: '16px', fontWeight: '400', letterSpacing: '0.005em' }],
  'xs-medium': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.005em' }],
  'xs-semibold': ['12px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.005em' }],
  'xs-bold': ['12px', { lineHeight: '16px', fontWeight: '700', letterSpacing: '0.005em' }],

  // Small
  'sm-regular': ['14px', { lineHeight: '20px', fontWeight: '400' }],
  'sm-medium': ['14px', { lineHeight: '20px', fontWeight: '500' }],
  'sm-semibold': ['14px', { lineHeight: '20px', fontWeight: '600' }],
  'sm-bold': ['14px', { lineHeight: '20px', fontWeight: '700' }],

  // Medium (Base)
  'md-regular': ['16px', { lineHeight: '24px', fontWeight: '400' }],
  'md-medium': ['16px', { lineHeight: '24px', fontWeight: '500' }],
  'md-semibold': ['16px', { lineHeight: '24px', fontWeight: '600' }],
  'md-bold': ['16px', { lineHeight: '24px', fontWeight: '700' }],

  // Large
  'lg-regular': ['18px', { lineHeight: '28px', fontWeight: '400', letterSpacing: '-0.01em' }],
  'lg-medium': ['18px', { lineHeight: '28px', fontWeight: '500', letterSpacing: '-0.01em' }],
  'lg-semibold': ['18px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.01em' }],
  'lg-bold': ['18px', { lineHeight: '28px', fontWeight: '700', letterSpacing: '-0.01em' }],

  // Extra Large
  'xl-regular': ['20px', { lineHeight: '30px', fontWeight: '400', letterSpacing: '-0.01em' }],
  'xl-medium': ['20px', { lineHeight: '30px', fontWeight: '500', letterSpacing: '-0.01em' }],
  'xl-semibold': ['20px', { lineHeight: '30px', fontWeight: '600', letterSpacing: '-0.01em' }],
  'xl-bold': ['20px', { lineHeight: '30px', fontWeight: '700', letterSpacing: '-0.01em' }],

  // 2X Large
  '2xl-regular': ['24px', { lineHeight: '32px', fontWeight: '400', letterSpacing: '-0.015em' }],
  '2xl-medium': ['24px', { lineHeight: '32px', fontWeight: '500', letterSpacing: '-0.015em' }],
  '2xl-semibold': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.015em' }],
  '2xl-bold': ['24px', { lineHeight: '32px', fontWeight: '700', letterSpacing: '-0.015em' }],

  // 3X Large
  '3xl-regular': ['30px', { lineHeight: '36px', fontWeight: '400', letterSpacing: '-0.02em' }],
  '3xl-medium': ['30px', { lineHeight: '36px', fontWeight: '500', letterSpacing: '-0.02em' }],
  '3xl-semibold': ['30px', { lineHeight: '36px', fontWeight: '600', letterSpacing: '-0.02em' }],
  '3xl-bold': ['30px', { lineHeight: '36px', fontWeight: '700', letterSpacing: '-0.02em' }],

  // Display Sizes
  'display-xs-regular': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '400' }],
  'display-xs-medium': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '500' }],
  'display-xs-semibold': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '600' }],
  'display-xs-bold': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '700' }],

  'display-sm-regular': ['30px', { lineHeight: '38px', letterSpacing: '-0.025em', fontWeight: '400' }],
  'display-sm-medium': ['30px', { lineHeight: '38px', letterSpacing: '-0.025em', fontWeight: '500' }],
  'display-sm-semibold': ['30px', { lineHeight: '38px', letterSpacing: '-0.025em', fontWeight: '600' }],
  'display-sm-bold': ['30px', { lineHeight: '38px', letterSpacing: '-0.025em', fontWeight: '700' }],

  'display-md-regular': ['36px', { lineHeight: '44px', letterSpacing: '-0.025em', fontWeight: '400' }],
  'display-md-medium': ['36px', { lineHeight: '44px', letterSpacing: '-0.025em', fontWeight: '500' }],
  'display-md-semibold': ['36px', { lineHeight: '44px', letterSpacing: '-0.025em', fontWeight: '600' }],
  'display-md-bold': ['36px', { lineHeight: '44px', letterSpacing: '-0.025em', fontWeight: '700' }],

  'display-lg-regular': ['48px', { lineHeight: '60px', letterSpacing: '-0.03em', fontWeight: '400' }],
  'display-lg-medium': ['48px', { lineHeight: '60px', letterSpacing: '-0.03em', fontWeight: '500' }],
  'display-lg-semibold': ['48px', { lineHeight: '60px', letterSpacing: '-0.03em', fontWeight: '600' }],
  'display-lg-bold': ['48px', { lineHeight: '60px', letterSpacing: '-0.03em', fontWeight: '700' }],

  'display-xl-regular': ['60px', { lineHeight: '72px', letterSpacing: '-0.03em', fontWeight: '400' }],
  'display-xl-medium': ['60px', { lineHeight: '72px', letterSpacing: '-0.03em', fontWeight: '500' }],
  'display-xl-semibold': ['60px', { lineHeight: '72px', letterSpacing: '-0.03em', fontWeight: '600' }],
  'display-xl-bold': ['60px', { lineHeight: '72px', letterSpacing: '-0.03em', fontWeight: '700' }],

  'display-2xl-regular': ['72px', { lineHeight: '90px', letterSpacing: '-0.04em', fontWeight: '400' }],
  'display-2xl-medium': ['72px', { lineHeight: '90px', letterSpacing: '-0.04em', fontWeight: '500' }],
  'display-2xl-semibold': ['72px', { lineHeight: '90px', letterSpacing: '-0.04em', fontWeight: '600' }],
  'display-2xl-bold': ['72px', { lineHeight: '90px', letterSpacing: '-0.04em', fontWeight: '700' }],

  // Hero Display (New)
  'hero-regular': ['96px', { lineHeight: '104px', letterSpacing: '-0.05em', fontWeight: '400' }],
  'hero-medium': ['96px', { lineHeight: '104px', letterSpacing: '-0.05em', fontWeight: '500' }],
  'hero-semibold': ['96px', { lineHeight: '104px', letterSpacing: '-0.05em', fontWeight: '600' }],
  'hero-bold': ['96px', { lineHeight: '104px', letterSpacing: '-0.05em', fontWeight: '700' }],
};
