import { AppBackgroundStyle } from '@/context/dhulo-store';
import { ThemeId } from '@/lib/dhulo';

export const THEME_IDS: ThemeId[] = ['obsidian', 'aurora', 'signal', 'petal', 'archive', 'daylight'];
export const NOTE_COLOR_IDS: ThemeId[] = ['obsidian', 'aurora', 'signal', 'petal', 'archive', 'daylight'];

export const DAY_VALUES = Array.from({ length: 31 }, (_, index) => index);
export const HOUR_VALUES = Array.from({ length: 24 }, (_, index) => index);
export const MINUTE_VALUES = Array.from({ length: 60 }, (_, index) => index);
export const DURATION_ITEM_HEIGHT = 40;

export const BACKGROUND_OPTIONS: { id: AppBackgroundStyle; name: string; caption: string }[] = [
  { id: 'void', name: 'Fog', caption: 'quiet dust in black air' },
  { id: 'mist', name: 'Rain glass', caption: 'soft translucent movement' },
  { id: 'paper', name: 'Paper grain', caption: 'warm fibers and pale ink' },
  { id: 'garden', name: 'Ink bloom', caption: 'organic marks drifting apart' },
  { id: 'signal', name: 'Blurred stars', caption: 'thin light across darkness' },
];

export const DURATION_PRESETS = [15, 30, 60, 180, 720, 1440];
