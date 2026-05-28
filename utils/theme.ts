import { DHULO_THEMES, ThemeId } from '@/lib/dhulo';

export function getTheme(themeId: ThemeId) {
  return DHULO_THEMES[themeId] ?? DHULO_THEMES.obsidian;
}

export function readableOverlay(color: string, alpha = 'DD') {
  return `${color}${alpha}`;
}
