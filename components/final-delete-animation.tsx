import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  ReduceMotion,
  type SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { decayText, DHULO_THEMES, DhuloNote } from '@/lib/dhulo';
import { FINAL_DELETE_DURATION } from '@/utils/animation';

const PARTICLES = Array.from({ length: 18 }, (_, index) => index);
const STRIPS = Array.from({ length: 7 }, (_, index) => index);

export function FinalDeleteAnimation({ note, onFinish }: { note: DhuloNote; onFinish: () => void }) {
  const theme = DHULO_THEMES[note.themeId];
  const motion = useSharedValue(0);
  const duration = FINAL_DELETE_DURATION[note.decayStyle] + 380;
  const title = decayText(note.title, 0.9, note.decayStyle, `${note.id}-final-title`, 0);
  const body = decayText(
    note.body || 'This image note has reached the end of its time.',
    0.92,
    note.decayStyle,
    `${note.id}-final-body`,
    0
  );

  useEffect(() => {
    motion.value = 0;
    motion.value = withTiming(1, {
      duration,
      easing: Easing.bezier(0.22, 0.72, 0.18, 1),
      reduceMotion: ReduceMotion.System,
    });
    const finishTimer = setTimeout(onFinish, duration + 80);
    return () => clearTimeout(finishTimer);
  }, [duration, motion, note.id, onFinish]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(motion.value, [0, 0.16, 0.82, 1], [0, 0.78, 0.74, 0], Extrapolation.CLAMP),
  }));

  const paperStyle = useAnimatedStyle(() => {
    const value = motion.value;

    if (note.decayStyle === 'ash') {
      return {
        opacity: interpolate(value, [0, 0.7, 1], [1, 0.9, 0], Extrapolation.CLAMP),
        transform: [
          { translateY: interpolate(value, [0, 1], [0, 52]) },
          { scale: interpolate(value, [0, 0.66, 1], [1, 0.96, 0.76]) },
          { rotate: `${interpolate(value, [0, 1], [0, -3])}deg` },
        ],
      };
    }

    if (note.decayStyle === 'blur') {
      return {
        opacity: interpolate(value, [0, 0.44, 1], [1, 0.5, 0], Extrapolation.CLAMP),
        transform: [
          { translateY: interpolate(value, [0, 1], [0, -18]) },
          { scale: interpolate(value, [0, 1], [1, 1.34]) },
        ],
      };
    }

    return {
      opacity: interpolate(value, [0, 0.74, 1], [1, 0.94, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(value, [0, 1], [0, -26]) },
        { scaleX: interpolate(value, [0, 0.65, 1], [1, 1.2, 1.48]) },
        { scaleY: interpolate(value, [0, 0.65, 1], [1, 0.88, 0.62]) },
      ],
    };
  });

  const messageStyle = useAnimatedStyle(() => ({
    opacity: interpolate(motion.value, [0, 0.55, 0.74, 1], [0, 0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(motion.value, [0.55, 0.76, 1], [12, 0, -8], Extrapolation.CLAMP) }],
  }));

  return (
    <View accessibilityLabel="Releasing note" pointerEvents="none" style={styles.layer}>
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <Animated.View
        style={[
          styles.paper,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            boxShadow: `0 24px 64px ${theme.shadow}66`,
          },
          paperStyle,
        ]}>
        {note.imageUri ? (
          <Image
            blurRadius={note.decayStyle === 'blur' ? 14 : 2}
            contentFit="cover"
            source={{ uri: note.imageUri }}
            style={styles.image}
          />
        ) : null}
        <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
        <Text numberOfLines={6} style={[styles.body, { color: theme.muted }]}>
          {body}
        </Text>

        {note.decayStyle === 'drift' || note.decayStyle === 'scramble' ? (
          <View style={StyleSheet.absoluteFill}>
            {STRIPS.map((strip) => (
              <ReleaseStrip key={strip} motion={motion} strip={strip} surface={theme.elevated} />
            ))}
          </View>
        ) : null}
      </Animated.View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {PARTICLES.map((particle) => (
          <ReleaseParticle
            accent={note.decayStyle === 'ash' ? '#E99B48' : theme.accent}
            key={particle}
            motion={motion}
            particle={particle}
          />
        ))}
      </View>

      <Animated.View style={[styles.releaseMessage, messageStyle]}>
        <Text style={[styles.releaseEyebrow, { color: theme.accent }]}>GONE</Text>
        <Text style={[styles.releaseText, { color: theme.text }]}>Removed from this device.</Text>
      </Animated.View>
    </View>
  );
}

function ReleaseParticle({
  accent,
  motion,
  particle,
}: {
  accent: string;
  motion: SharedValue<number>;
  particle: number;
}) {
  const angle = (particle / PARTICLES.length) * Math.PI * 2;
  const distance = 90 + (particle % 5) * 22;
  const delay = (particle % 6) * 0.025;
  const size = 3 + (particle % 4) * 1.6;
  const style = useAnimatedStyle(() => {
    const local = Math.max(0, (motion.value - 0.22 - delay) / (0.78 - delay));
    return {
      opacity: interpolate(local, [0, 0.18, 0.78, 1], [0, 0.9, 0.54, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: Math.cos(angle) * distance * local },
        { translateY: Math.sin(angle) * distance * local + 34 * local * local },
        { scale: interpolate(local, [0, 0.2, 1], [0.2, 1, 0.3], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: accent,
          borderRadius: particle % 3 === 0 ? 1 : 99,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          width: size,
        },
        style,
      ]}
    />
  );
}

function ReleaseStrip({
  motion,
  strip,
  surface,
}: {
  motion: SharedValue<number>;
  strip: number;
  surface: string;
}) {
  const direction = strip % 2 === 0 ? 1 : -1;
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(motion.value, [0, 0.38, 0.82, 1], [0, 0.86, 0.62, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(motion.value, [0.38, 1], [0, direction * (170 + strip * 14)], Extrapolation.CLAMP) },
      { rotate: `${direction * (2 + strip * 0.3)}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.strip,
        {
          backgroundColor: surface,
          top: `${strip * 13 + 5}%`,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#03060D',
  },
  body: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 24,
    paddingTop: 14,
  },
  image: {
    borderCurve: 'continuous',
    borderRadius: 16,
    height: 118,
    marginBottom: 16,
    width: '100%',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 80,
  },
  paper: {
    borderCurve: 'continuous',
    borderRadius: 26,
    borderWidth: 1,
    maxWidth: 370,
    minHeight: 290,
    overflow: 'hidden',
    padding: 24,
    width: '82%',
  },
  particle: {
    left: '50%',
    position: 'absolute',
    top: '50%',
  },
  releaseEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  releaseMessage: {
    alignItems: 'center',
    bottom: '17%',
    gap: 6,
    position: 'absolute',
  },
  releaseText: {
    fontSize: 15,
    fontWeight: '700',
  },
  strip: {
    height: 8,
    left: -20,
    position: 'absolute',
    right: -20,
  },
  title: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
});
