/* eslint-disable sort-keys-fix/sort-keys-fix */

export const SIZES = {
    // Base spacing units (in pixels)
    '2xs': 2.5, // ~0.156rem
    xs: 5, // 0.3125rem
    sm: 10, // 0.625rem
    md: 15, // 0.9375rem (base)
    lg: 20, // 1.25rem
    xl: 30, // 1.875rem
    '2xl': 40, // 2.5rem
    '3xl': 50, // 3.125rem
    '4xl': 60, // 3.75rem
    '5xl': 70, // 4.375rem
    '6xl': 80, // 5rem
} as const;

// Font sizes
export const FONT_SIZES = {
    '2xs': 10, // 0.625rem
    xs: 12, // 0.75rem
    sm: 14, // 0.875rem
    md: 16, // 1rem
    lg: 18, // 1.125rem
    xl: 20, // 1.25rem
    '2xl': 24, // 1.5rem
    '3xl': 30, // 1.875rem
    '4xl': 36, // 2.25rem
    '5xl': 48, // 3rem
    '6xl': 60, // 3.75rem
} as const;

// Border radius
export const RADII = {
    xs: 2.5,
    sm: 5,
    md: 7.5,
    lg: 10,
    xl: 15,
    '2xl': 20,
    '3xl': 30,
    full: 9999,
} as const;

// For TypeScript type safety
export type Size = keyof typeof SIZES;
export type FontSize = keyof typeof FONT_SIZES;
export type Radius = keyof typeof RADII;
