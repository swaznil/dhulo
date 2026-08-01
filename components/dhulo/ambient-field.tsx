import { PropsWithChildren, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { DhuloTheme } from '@/lib/dhulo';

type AmbientFieldProps = PropsWithChildren<{
  animated?: boolean;
  backgroundStyle?: DhuloTheme['backgroundStyle'];
  theme: DhuloTheme;
}>;

const DUST = [
  [8, 16, 3], [23, 72, 2], [38, 29, 4], [52, 88, 2], [64, 12, 3],
  [73, 56, 2], [88, 24, 4], [92, 81, 2], [14, 43, 2], [47, 61, 3],
];
const RAIN = [
  [8, 15, 118, -12], [48, 27, 176, -7], [4, 59, 148, -16], [58, 73, 132, -9],
];
const PAPER_LINES = Array.from({ length: 11 }, (_, index) => 12 + index * 8);
const GARDEN = [
  [9, 64, -18], [26, 78, 12], [48, 68, -8], [70, 82, 16], [88, 70, -14],
];
const SIGNAL_LINES = [14, 27, 43, 62, 78, 89];
const HEARTS = [[10, 17], [29, 74], [48, 28], [67, 82], [86, 47], [78, 12]];
const STARS = [[8, 21], [17, 74], [34, 13], [52, 66], [72, 26], [89, 78], [94, 39]];
const BLOCKS = [
  [7, 13, 82, 56, -7], [63, 8, 104, 70, 5], [18, 56, 122, 76, 3], [69, 67, 80, 98, -6],
];

export function AmbientField({ animated = true, backgroundStyle, children, theme }: AmbientFieldProps) {
  const motion = useSharedValue(0);
  const activeBackgroundStyle = backgroundStyle ?? theme.backgroundStyle;

  useEffect(() => {
    cancelAnimation(motion);
    motion.value = 0;

    if (!animated) {
      return;
    }

    motion.value = withRepeat(
      withTiming(1, {
        duration: 9000,
        easing: Easing.inOut(Easing.sin),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true
    );

    return () => cancelAnimation(motion);
  }, [animated, motion]);

  const fieldMotion = useAnimatedStyle(() => ({
    opacity: 0.82 + motion.value * 0.18,
    transform: [{ translateX: -3 + motion.value * 6 }, { translateY: 4 - motion.value * 8 }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, fieldMotion]}>
        <BackgroundArtwork backgroundStyle={activeBackgroundStyle} theme={theme} />
      </Animated.View>
      {children}
    </View>
  );
}

export function BackgroundArtwork({ backgroundStyle, theme }: { backgroundStyle: DhuloTheme['backgroundStyle']; theme: DhuloTheme }) {
  if (backgroundStyle === 'mist') {
    return (
      <View style={StyleSheet.absoluteFill}>
        {RAIN.map(([left, top, width, rotate], index) => (
          <View
            key={index}
            style={[
              styles.rainStroke,
              {
                backgroundColor: index % 2 ? theme.secondary : theme.accent,
                left: `${left}%`,
                opacity: 0.07 + index * 0.018,
                top: `${top}%`,
                transform: [{ rotate: `${rotate}deg` }],
                width,
              },
            ]}
          />
        ))}
        <View style={[styles.mistPool, { backgroundColor: theme.secondary }]} />
      </View>
    );
  }

  if (backgroundStyle === 'paper') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <View style={[styles.paperMargin, { backgroundColor: theme.secondary }]} />
        {PAPER_LINES.map((top, index) => (
          <View key={top} style={[styles.paperRule, { backgroundColor: theme.accent, opacity: index % 4 === 0 ? 0.13 : 0.075, top: `${top}%` }]} />
        ))}
        {DUST.slice(0, 7).map(([left, top, size], index) => (
          <View
            key={index}
            style={[
              styles.fibre,
              {
                backgroundColor: index % 2 ? theme.secondary : theme.accent,
                height: 1,
                left: `${left}%`,
                top: `${top}%`,
                transform: [{ rotate: `${index * 17 - 29}deg` }],
                width: size * 5,
              },
            ]}
          />
        ))}
      </View>
    );
  }

  if (backgroundStyle === 'garden') {
    return (
      <View style={StyleSheet.absoluteFill}>
        {GARDEN.map(([left, top, rotate], index) => (
          <View key={index} style={[styles.stem, { backgroundColor: theme.accent, left: `${left}%`, top: `${top}%`, transform: [{ rotate: `${rotate}deg` }] }]}>
            <View style={[styles.leaf, styles.leafLeft, { backgroundColor: theme.secondary }]} />
            <View style={[styles.leaf, styles.leafRight, { backgroundColor: theme.accent }]} />
          </View>
        ))}
        <View style={[styles.gardenMoon, { borderColor: theme.secondary }]} />
      </View>
    );
  }

  if (backgroundStyle === 'signal') {
    return (
      <View style={StyleSheet.absoluteFill}>
        {SIGNAL_LINES.map((top, index) => (
          <View
            key={top}
            style={[
              styles.signalLine,
              {
                backgroundColor: index === 2 ? theme.accent : theme.secondary,
                left: `${index % 2 ? 18 : 4}%`,
                opacity: index === 2 ? 0.24 : 0.08,
                top: `${top}%`,
                width: `${index % 3 === 0 ? 56 : 78}%`,
              },
            ]}
          />
        ))}
        <View style={[styles.signalDial, { borderColor: theme.accent }]} />
        <View style={[styles.signalDot, { backgroundColor: theme.accent }]} />
        <Text style={[styles.frequency, { color: theme.secondary }]}>98.7</Text>
      </View>
    );
  }

  if (backgroundStyle === 'hearts') {
    return (
      <View style={StyleSheet.absoluteFill}>
        {HEARTS.map(([left, top], index) => (
          <View key={index} style={[styles.heart, { left: `${left}%`, opacity: 0.09 + index * 0.014, top: `${top}%`, transform: [{ rotate: `${index % 2 ? 36 : 51}deg` }] }]}>
            <View style={[styles.heartBody, { backgroundColor: index % 2 ? theme.secondary : theme.accent }]} />
            <View style={[styles.heartLobe, styles.heartLobeLeft, { backgroundColor: index % 2 ? theme.secondary : theme.accent }]} />
            <View style={[styles.heartLobe, styles.heartLobeRight, { backgroundColor: index % 2 ? theme.secondary : theme.accent }]} />
          </View>
        ))}
        <Text style={[styles.doodleNote, { color: theme.accent }]}>oh, well.</Text>
      </View>
    );
  }

  if (backgroundStyle === 'orbit') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <View style={[styles.orbit, styles.orbitLarge, { borderColor: theme.accent }]} />
        <View style={[styles.orbit, styles.orbitSmall, { borderColor: theme.secondary }]} />
        <View style={[styles.planet, { backgroundColor: theme.accent }]} />
        {STARS.map(([left, top], index) => (
          <View key={index} style={[styles.star, { backgroundColor: index % 2 ? theme.secondary : theme.accent, left: `${left}%`, top: `${top}%` }]} />
        ))}
      </View>
    );
  }

  if (backgroundStyle === 'blocks') {
    return (
      <View style={StyleSheet.absoluteFill}>
        {BLOCKS.map(([left, top, width, height, rotate], index) => (
          <View
            key={index}
            style={[
              styles.collageCard,
              {
                backgroundColor: index % 2 ? theme.elevated : theme.surface,
                borderColor: index % 2 ? theme.secondary : theme.accent,
                height,
                left: `${left}%`,
                top: `${top}%`,
                transform: [{ rotate: `${rotate}deg` }],
                width,
              },
            ]}>
            <View style={[styles.collageLine, { backgroundColor: theme.muted, width: '68%' }]} />
            <View style={[styles.collageLine, { backgroundColor: theme.faint, width: '44%' }]} />
          </View>
        ))}
        <View style={[styles.collageTape, { backgroundColor: theme.accent }]} />
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      {DUST.map(([left, top, size], index) => (
        <View
          key={index}
          style={[
            styles.dust,
            {
              backgroundColor: index % 3 === 0 ? theme.secondary : theme.accent,
              height: size,
              left: `${left}%`,
              opacity: 0.09 + (index % 4) * 0.025,
              top: `${top}%`,
              width: size,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  collageCard: {
    borderCurve: 'continuous',
    borderRadius: 7,
    borderWidth: 1,
    gap: 9,
    opacity: 0.13,
    padding: 12,
    position: 'absolute',
  },
  collageLine: {
    borderRadius: 99,
    height: 3,
  },
  collageTape: {
    height: 20,
    left: '42%',
    opacity: 0.14,
    position: 'absolute',
    top: '51%',
    transform: [{ rotate: '-9deg' }],
    width: 76,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  doodleNote: {
    bottom: '13%',
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: '700',
    opacity: 0.18,
    position: 'absolute',
    right: '12%',
    transform: [{ rotate: '-7deg' }],
  },
  dust: {
    borderRadius: 99,
    position: 'absolute',
  },
  fibre: {
    opacity: 0.12,
    position: 'absolute',
  },
  frequency: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.13,
    position: 'absolute',
    right: '9%',
    top: '35%',
  },
  gardenMoon: {
    borderRadius: 999,
    borderWidth: 2,
    height: 110,
    opacity: 0.08,
    position: 'absolute',
    right: '-4%',
    top: '9%',
    width: 110,
  },
  heart: {
    height: 24,
    position: 'absolute',
    width: 24,
  },
  heartBody: {
    bottom: 1,
    height: 17,
    left: 4,
    position: 'absolute',
    width: 17,
  },
  heartLobe: {
    borderRadius: 99,
    height: 17,
    position: 'absolute',
    width: 17,
  },
  heartLobeLeft: {
    left: 0,
    top: 3,
  },
  heartLobeRight: {
    left: 7,
    top: -4,
  },
  leaf: {
    borderRadius: 999,
    height: 18,
    opacity: 0.18,
    position: 'absolute',
    width: 9,
  },
  leafLeft: {
    left: -8,
    top: 18,
    transform: [{ rotate: '-42deg' }],
  },
  leafRight: {
    right: -8,
    top: 38,
    transform: [{ rotate: '42deg' }],
  },
  mistPool: {
    borderRadius: 999,
    bottom: '-8%',
    height: 180,
    left: '12%',
    opacity: 0.055,
    position: 'absolute',
    transform: [{ rotate: '-5deg' }],
    width: '90%',
  },
  orbit: {
    borderRadius: 999,
    borderWidth: 2,
    opacity: 0.1,
    position: 'absolute',
    transform: [{ rotate: '-18deg' }],
  },
  orbitLarge: {
    height: 310,
    left: '-20%',
    top: '12%',
    width: 480,
  },
  orbitSmall: {
    bottom: '-5%',
    height: 210,
    right: '-18%',
    width: 310,
  },
  paperMargin: {
    bottom: 0,
    left: '15%',
    opacity: 0.09,
    position: 'absolute',
    top: 0,
    width: 1,
  },
  paperRule: {
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  planet: {
    borderRadius: 999,
    height: 22,
    left: '58%',
    opacity: 0.2,
    position: 'absolute',
    top: '29%',
    width: 22,
  },
  rainStroke: {
    borderRadius: 99,
    height: 32,
    position: 'absolute',
  },
  signalDial: {
    borderRadius: 999,
    borderWidth: 1,
    height: 118,
    opacity: 0.1,
    position: 'absolute',
    right: '-2%',
    top: '22%',
    width: 118,
  },
  signalDot: {
    borderRadius: 99,
    height: 7,
    opacity: 0.42,
    position: 'absolute',
    right: '12%',
    top: '31%',
    width: 7,
  },
  signalLine: {
    height: 2,
    position: 'absolute',
  },
  star: {
    borderRadius: 99,
    height: 3,
    opacity: 0.24,
    position: 'absolute',
    width: 3,
  },
  stem: {
    borderRadius: 99,
    height: 118,
    opacity: 0.26,
    position: 'absolute',
    width: 2,
  },
});
