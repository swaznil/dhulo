import { memo, PropsWithChildren } from 'react';

import { AmbientField } from '@/components/dhulo/ambient-field';
import { AppBackgroundStyle } from '@/context/dhulo-store';
import { DhuloTheme } from '@/lib/dhulo';

type Props = PropsWithChildren<{
  animated?: boolean;
  backgroundStyle?: AppBackgroundStyle;
  theme: DhuloTheme;
}>;

export const AmbientBackground = memo(function AmbientBackground({ animated = true, backgroundStyle, children, theme }: Props) {
  return (
    <AmbientField animated={animated} backgroundStyle={backgroundStyle ?? theme.backgroundStyle} theme={theme}>
      {children}
    </AmbientField>
  );
});
