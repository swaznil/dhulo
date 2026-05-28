import { PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { DhuloTheme, ThemeId } from '@/lib/dhulo';
import { AMBIENT_MOTION_MS } from '@/utils/animation';

type AmbientFieldProps = PropsWithChildren<{
  backgroundStyle?: DhuloTheme['backgroundStyle'];
  theme: DhuloTheme;
}>;

const FIELD_BY_THEME: Record<ThemeId, { x: number; y: number; size: number; delay: number }[]> = {
  obsidian: [
    { x: 14, y: 18, size: 34, delay: 0 },
    { x: 74, y: 12, size: 22, delay: 0.18 },
    { x: 86, y: 42, size: 38, delay: 0.4 },
    { x: 18, y: 72, size: 24, delay: 0.6 },
    { x: 64, y: 84, size: 30, delay: 0.82 },
  ],
  graphite: [
    { x: 10, y: 16, size: 42, delay: 0.05 },
    { x: 76, y: 18, size: 36, delay: 0.22 },
    { x: 44, y: 48, size: 52, delay: 0.46 },
    { x: 16, y: 82, size: 34, delay: 0.7 },
    { x: 86, y: 74, size: 38, delay: 0.88 },
  ],
  noir: [
    { x: 16, y: 12, size: 42, delay: 0.08 },
    { x: 70, y: 24, size: 58, delay: 0.34 },
    { x: 9, y: 72, size: 50, delay: 0.52 },
    { x: 58, y: 84, size: 34, delay: 0.72 },
    { x: 88, y: 63, size: 46, delay: 0.92 },
  ],
  aurora: [
    { x: 18, y: 18, size: 44, delay: 0.04 },
    { x: 80, y: 16, size: 36, delay: 0.22 },
    { x: 68, y: 52, size: 60, delay: 0.44 },
    { x: 22, y: 78, size: 38, delay: 0.66 },
    { x: 90, y: 86, size: 30, delay: 0.86 },
  ],
  moss: [
    { x: 18, y: 18, size: 18, delay: 0.04 },
    { x: 80, y: 16, size: 14, delay: 0.22 },
    { x: 68, y: 52, size: 22, delay: 0.44 },
    { x: 22, y: 78, size: 16, delay: 0.66 },
    { x: 90, y: 86, size: 12, delay: 0.86 },
  ],
  paper: [
    { x: 8, y: 16, size: 62, delay: 0.12 },
    { x: 75, y: 11, size: 46, delay: 0.3 },
    { x: 14, y: 70, size: 54, delay: 0.54 },
    { x: 62, y: 80, size: 70, delay: 0.74 },
    { x: 90, y: 46, size: 40, delay: 0.94 },
  ],
  daylight: [
    { x: 7, y: 14, size: 78, delay: 0.08 },
    { x: 72, y: 13, size: 44, delay: 0.26 },
    { x: 18, y: 68, size: 58, delay: 0.5 },
    { x: 62, y: 82, size: 86, delay: 0.72 },
    { x: 90, y: 46, size: 36, delay: 0.92 },
  ],
  petal: [
    { x: 10, y: 12, size: 58, delay: 0.1 },
    { x: 72, y: 18, size: 76, delay: 0.28 },
    { x: 14, y: 76, size: 44, delay: 0.5 },
    { x: 58, y: 82, size: 64, delay: 0.72 },
    { x: 88, y: 54, size: 38, delay: 0.9 },
  ],
  archive: [
    { x: 8, y: 18, size: 52, delay: 0.06 },
    { x: 76, y: 12, size: 40, delay: 0.24 },
    { x: 28, y: 50, size: 72, delay: 0.48 },
    { x: 14, y: 84, size: 42, delay: 0.66 },
    { x: 86, y: 74, size: 58, delay: 0.9 },
  ],
  signal: [
    { x: 12, y: 13, size: 32, delay: 0.08 },
    { x: 72, y: 18, size: 54, delay: 0.24 },
    { x: 10, y: 70, size: 48, delay: 0.52 },
    { x: 58, y: 86, size: 28, delay: 0.7 },
    { x: 88, y: 62, size: 42, delay: 0.92 },
  ],
};
const EXTRA_MARKS = Array.from({ length: 4 }, (_, index) => index);

export function AmbientField({ backgroundStyle, children, theme }: AmbientFieldProps) {
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, {
          toValue: 1,
          duration: AMBIENT_MOTION_MS,
          isInteraction: false,
          useNativeDriver: true,
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: AMBIENT_MOTION_MS,
          isInteraction: false,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [motion]);

  const motes = useMemo(() => FIELD_BY_THEME[theme.id].filter((_, index) => index < 4), [theme.id]);
  const activeBackgroundStyle = backgroundStyle ?? theme.backgroundStyle;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {motes.map((mote, index) => {
        const translateY = motion.interpolate({
          inputRange: [0, 1],
          outputRange: [theme.id === 'moss' ? 8 : -5, theme.id === 'moss' ? -12 : 10],
        });
        const opacity = motion.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.12 + mote.delay * 0.16, 0.36, 0.1],
        });

        return (
          <Animated.View
            key={`${theme.id}-${index}`}
            pointerEvents="none"
            style={[
              styles.mote,
              {
                backgroundColor: index % 2 === 0 ? theme.accent : theme.secondary,
                borderRadius: activeBackgroundStyle === 'paper' ? 8 : activeBackgroundStyle === 'signal' ? 2 : 4,
                height:
                  activeBackgroundStyle === 'signal'
                    ? mote.size * 0.18
                    : activeBackgroundStyle === 'garden'
                      ? mote.size * 1.35
                      : mote.size * 0.72,
                left: `${mote.x}%`,
                opacity,
                top: `${mote.y}%`,
                transform: [
                  { translateY },
                  { rotate: activeBackgroundStyle === 'signal' ? '-18deg' : index % 2 === 0 ? '8deg' : '-10deg' },
                ],
                width: activeBackgroundStyle === 'signal' ? mote.size * 2.7 : mote.size * 1.5,
              },
            ]}
          />
        );
      })}
      {EXTRA_MARKS.map((mark) => {
        const drift = motion.interpolate({
          inputRange: [0, 1],
          outputRange: [mark % 2 === 0 ? -8 : 8, mark % 2 === 0 ? 12 : -12],
        });
        const size = 14 + ((mark * 11) % 36);

        return (
          <Animated.View
            key={`${activeBackgroundStyle}-extra-${mark}`}
            pointerEvents="none"
            style={[
              styles.extraMark,
              {
                backgroundColor: mark % 2 === 0 ? theme.accent : theme.secondary,
                borderRadius:
                  activeBackgroundStyle === 'signal'
                    ? 2
                    : activeBackgroundStyle === 'paper'
                      ? 3
                      : activeBackgroundStyle === 'garden'
                        ? 999
                        : 6,
                height:
                  activeBackgroundStyle === 'signal'
                    ? 3
                    : activeBackgroundStyle === 'paper'
                      ? size * 1.25
                      : activeBackgroundStyle === 'mist'
                        ? size * 0.44
                        : size,
                left: `${(mark * 19 + 8) % 92}%`,
                opacity: activeBackgroundStyle === 'void' ? 0.12 : 0.16,
                top: `${(mark * 13 + 10) % 88}%`,
                transform: [
                  { translateX: drift },
                  {
                    rotate:
                      activeBackgroundStyle === 'signal'
                        ? '-10deg'
                        : activeBackgroundStyle === 'garden'
                          ? `${mark % 2 === 0 ? -24 : 28}deg`
                          : `${mark % 2 === 0 ? 7 : -9}deg`,
                  },
                ],
                width:
                  activeBackgroundStyle === 'signal'
                    ? size * 3.8
                    : activeBackgroundStyle === 'mist'
                      ? size * 3.4
                      : activeBackgroundStyle === 'paper'
                        ? size * 1.8
                        : size,
              },
            ]}
          />
        );
      })}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  mote: {
    position: 'absolute',
  },
  extraMark: {
    position: 'absolute',
  },
});
