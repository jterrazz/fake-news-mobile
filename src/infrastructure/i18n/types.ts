import { defaultNS,resources } from './i18n.config.js';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof resources['en'];
  }
}

export type Language = keyof typeof resources; 