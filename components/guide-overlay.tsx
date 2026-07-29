import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DHULO_THEMES, ThemeId } from '@/lib/dhulo';

const brandMark = require('@/assets/images/brand-mark.png');

const GUIDE_STEPS = [
  {
    eyebrow: 'Welcome to Dhulo',
    icon: 'auto-stories' as const,
    title: 'Write it. Feel it. Let it move on.',
    body: 'Dhulo is a private journal for thoughts that only need to exist for a while. Everything stays on this device.',
  },
  {
    eyebrow: 'Give it a lifetime',
    icon: 'schedule' as const,
    title: 'You decide how long a note stays.',
    body: 'Choose minutes, hours, or days. Preserve something when you need more time, or let the countdown keep moving.',
  },
  {
    eyebrow: 'Choose its ending',
    icon: 'blur-on' as const,
    title: 'Every note fades in its own way.',
    body: 'Ash, drift, blur, and scramble slowly transform the note. Preview each style before you save.',
  },
  {
    eyebrow: 'Release with intention',
    icon: 'fast-forward' as const,
    title: 'Fast-forward, then choose.',
    body: 'Decay now visibly advances the note to its end. Nothing is erased until you confirm Release—and you can still Restore it.',
  },
];

type Props = {
  onComplete: () => void;
  onCreateNote: () => void;
  themeId: ThemeId;
};

export function GuideOverlay({ onComplete, onCreateNote, themeId }: Props) {
  const [step, setStep] = useState(0);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const theme = DHULO_THEMES[themeId];
  const item = GUIDE_STEPS[step];
  const isLast = step === GUIDE_STEPS.length - 1;
  const compact = width < 380;

  function advance() {
    if (isLast) {
      onComplete();
      onCreateNote();
      return;
    }

    setStep((current) => current + 1);
  }

  return (
    <Animated.View
      entering={FadeIn.duration(240)}
      style={[
        styles.layer,
        {
          backgroundColor: theme.background,
          paddingBottom: Math.max(insets.bottom, 20),
          paddingTop: Math.max(insets.top, 20),
        },
      ]}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Image contentFit="contain" source={brandMark} style={styles.brandMark} />
          <Text style={[styles.brandName, { color: theme.text }]}>Dhulo</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={onComplete}
          style={({ pressed }) => [styles.skip, { opacity: pressed ? 0.55 : 1 }]}>
          <Text style={[styles.skipText, { color: theme.muted }]}>Skip guide</Text>
        </Pressable>
      </View>

      <View style={styles.stage}>
        <Animated.View
          entering={FadeInRight.duration(300)}
          exiting={FadeOutLeft.duration(180)}
          key={step}
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              padding: compact ? 24 : 30,
            },
          ]}>
          <View style={[styles.illustration, { backgroundColor: theme.elevated }]}>
            {step === 0 ? (
              <Image contentFit="contain" source={brandMark} style={styles.heroMark} />
            ) : (
              <MaterialIcons color={theme.accent} name={item.icon} size={compact ? 58 : 68} />
            )}
          </View>
          <Text style={[styles.eyebrow, { color: theme.accent }]}>{item.eyebrow}</Text>
          <Text style={[styles.title, { color: theme.text, fontSize: compact ? 29 : 34 }]}>{item.title}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>{item.body}</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View accessibilityLabel={`Step ${step + 1} of ${GUIDE_STEPS.length}`} style={styles.dots}>
          {GUIDE_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === step ? theme.accent : theme.border,
                  width: index === step ? 24 : 7,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.footerActions}>
          {step > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep((current) => current - 1)}
              style={[styles.backButton, { borderColor: theme.border }]}>
              <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={advance}
            style={({ pressed }) => [
              styles.nextButton,
              {
                backgroundColor: theme.accent,
                flex: step > 0 ? 1 : undefined,
                opacity: pressed ? 0.72 : 1,
              },
            ]}>
            <Text style={[styles.nextText, { color: theme.background }]}>
              {isLast ? 'Write my first note' : 'Continue'}
            </Text>
            <MaterialIcons color={theme.background} name={isLast ? 'edit' : 'arrow-forward'} size={19} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 22,
  },
  backText: {
    fontSize: 15,
    fontWeight: '800',
  },
  body: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 25,
  },
  brandMark: {
    height: 38,
    width: 38,
  },
  brandName: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  card: {
    borderCurve: 'continuous',
    borderRadius: 32,
    borderWidth: 1,
    gap: 15,
    maxWidth: 520,
    width: '100%',
  },
  dot: {
    borderRadius: 99,
    height: 7,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footer: {
    gap: 20,
    paddingHorizontal: 22,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  heroMark: {
    height: 185,
    width: 185,
  },
  illustration: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderCurve: 'continuous',
    borderRadius: 24,
    height: 210,
    justifyContent: 'center',
    marginBottom: 4,
    overflow: 'hidden',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 100,
  },
  nextButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 24,
  },
  nextText: {
    fontSize: 15,
    fontWeight: '900',
  },
  skip: {
    padding: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  title: {
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 39,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
});
