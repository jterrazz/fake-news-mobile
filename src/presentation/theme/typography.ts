import { Platform } from 'react-native';

const createFontVariant = (weight: string) =>
    Platform.select({
        android: `Geist-${weight}`,
        default: `Geist-${weight}`,
        ios: `Geist-${weight}`,
    });

export const FONT_FAMILY = {
    black: createFontVariant('Black'),
    bold: createFontVariant('Bold'),
    extraBold: createFontVariant('ExtraBold'),
    extraLight: createFontVariant('ExtraLight'),
    light: createFontVariant('Light'),
    medium: createFontVariant('Medium'),
    regular: createFontVariant('Regular'),
    semibold: createFontVariant('SemiBold'),
    thin: createFontVariant('Thin'),
} as const;

export const FONT_WEIGHT = {
    black: '900',
    bold: '700',
    extraBold: '800',
    extraLight: '200',
    light: '300',
    medium: '500',
    regular: '400',
    semibold: '600',
    thin: '100',
} as const;

export type FontWeight = keyof typeof FONT_WEIGHT;
