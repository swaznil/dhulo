import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const brandMark = require('@/assets/images/brand-mark.png');

export function BrandLoader() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const pulse = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 0;
      return;
    }

    pulse.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [pulse, reduceMotion]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: 0.86 + pulse.value * 0.14,
    transform: [{ translateY: -pulse.value * 4 }, { scale: 0.98 + pulse.value * 0.02 }],
  }));

  return (
    <View accessibilityLabel="Dhulo is getting your notes ready" style={styles.container}>
      <Animated.View entering={FadeIn.duration(260)} style={[styles.markWrap, markStyle]}>
        <Image contentFit="contain" source={brandMark} style={styles.mark} />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(120).duration(320)} style={styles.copy}>
        <Text style={styles.name}>Dhulo</Text>
        <Text style={styles.caption}>Put it down. Let time take it.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: {
    color: '#AEB9C9',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#0B1730',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  copy: {
    alignItems: 'center',
    gap: 7,
  },
  mark: {
    height: 190,
    width: 190,
  },
  markWrap: {
    alignItems: 'center',
    height: 210,
    justifyContent: 'center',
    width: 210,
  },
  name: {
    color: '#FFF5E6',
    fontSize: 33,
    fontWeight: '800',
    letterSpacing: -1,
  },
});
