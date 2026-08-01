import { AppBackgroundStyle } from '@/context/dhulo-store';
import { ThemeId } from '@/lib/dhulo';

export const THEME_IDS: ThemeId[] = [
  'noir',
  'paper',
  'graphite',
  'aurora',
  'moss',
  'signal',
  'daylight',
  'petal',
  'archive',
  'obsidian',
];
export const NOTE_COLOR_IDS: ThemeId[] = ['obsidian', 'noir', 'aurora', 'moss', 'signal', 'daylight', 'petal', 'archive'];

export const DAY_VALUES = Array.from({ length: 31 }, (_, index) => index);
export const HOUR_VALUES = Array.from({ length: 24 }, (_, index) => index);
export const MINUTE_VALUES = Array.from({ length: 60 }, (_, index) => index);
export const DURATION_ITEM_HEIGHT = 40;

export const BACKGROUND_OPTIONS: { id: AppBackgroundStyle; name: string }[] = [
  { id: 'void', name: 'Still' },
  { id: 'mist', name: 'Rain window' },
  { id: 'paper', name: 'Ruled page' },
  { id: 'garden', name: 'Back garden' },
  { id: 'blocks', name: 'Cut paper' },
  { id: 'signal', name: 'Night radio' },
  { id: 'hearts', name: 'Doodles' },
  { id: 'orbit', name: 'Planetarium' },
];

export const DURATION_PRESETS = [15, 30, 60, 180, 720, 1440];
