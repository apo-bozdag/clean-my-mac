import { writable } from 'svelte/store';

export type Theme = 'purple' | 'green' | 'blue' | 'orange';

interface ThemeConfig {
  from: string;
  to: string;
  accent: string;
  glass: string;
}

export const themeConfigs: Record<Theme, ThemeConfig> = {
  purple: {
    from: 'from-purple-900',
    to: 'to-purple-800',
    accent: 'bg-purple-600',
    glass: 'bg-purple-950/30'
  },
  green: {
    from: 'from-green-900',
    to: 'to-green-800',
    accent: 'bg-green-600',
    glass: 'bg-green-950/30'
  },
  blue: {
    from: 'from-blue-900',
    to: 'to-blue-800',
    accent: 'bg-blue-600',
    glass: 'bg-blue-950/30'
  },
  orange: {
    from: 'from-orange-900',
    to: 'to-orange-800',
    accent: 'bg-orange-600',
    glass: 'bg-orange-950/30'
  }
};

export const currentTheme = writable<Theme>('purple'); 