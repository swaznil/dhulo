import { useMemo } from 'react';

import { DHULO_THEMES, ThemeId } from '@/lib/dhulo';

export function useTheme(themeId: ThemeId) {
  return useMemo(() => DHULO_THEMES[themeId] ?? DHULO_THEMES.obsidian, [themeId]);
}
