import { memo, PropsWithChildren } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { AmbientField } from '@/components/dhulo/ambient-field';
import { AppBackgroundStyle, useSettings } from '@/context/dhulo-store';
import { DhuloTheme } from '@/lib/dhulo';

type Props = PropsWithChildren<{
  animated?: boolean;
  backgroundStyle?: AppBackgroundStyle;
  theme: DhuloTheme;
}>;

export const AmbientBackground = memo(function AmbientBackground({ animated, backgroundStyle, children, theme }: Props) {
  const { ambientMotionEnabled } = useSettings();
  const reduceMotion = useReducedMotion();
  return (
    <AmbientField animated={(animated ?? ambientMotionEnabled) && !reduceMotion} backgroundStyle={backgroundStyle ?? theme.backgroundStyle} theme={theme}>
      {children}
    </AmbientField>
  );
});
