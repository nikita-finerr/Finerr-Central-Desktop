import { Fonts } from './fonts';

export const Typography = {
  h1: {
    fontSize: 28,
    fontFamily: Fonts.bold,
  },
  h2: {
    fontSize: 24,
    fontFamily: Fonts.semiBold,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
  },
  body: {
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  caption: {
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
} as const;

export const FontSizes = {
  xs: Typography.caption.fontSize,
  sm: Typography.body.fontSize,
  md: 16,
  lg: 18,
  xl: Typography.title.fontSize,
  xxl: Typography.h2.fontSize,
  xxxl: 32,
} as const;
