import { memo, useMemo } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

import { DecayStyle, decayText } from '@/lib/dhulo';

type DecayTextProps = {
  text: string;
  progress: number;
  styleId: DecayStyle;
  seed: string;
  now: number;
  color: string;
  mutedColor: string;
  size?: number;
  lineHeight?: number;
  weight?: TextStyle['fontWeight'];
  numberOfLines?: number;
};

function DecayTextInner({
  text,
  progress,
  styleId,
  seed,
  now,
  color,
  mutedColor,
  size = 16,
  lineHeight = 24,
  weight = '400',
  numberOfLines,
}: DecayTextProps) {
  const tick = Math.floor(now / (styleId === 'scramble' ? 1200 : styleId === 'ash' ? 1600 : 3000));
  const visualProgress = Math.round(progress * 50) / 50;
  const renderedText = useMemo(
    () => decayText(text, visualProgress, styleId, seed, tick),
    [seed, styleId, text, tick, visualProgress]
  );
  const textColor =
    styleId === 'ash' && visualProgress > 0.56
      ? '#7c2d12'
      : styleId === 'ash' && visualProgress > 0.34
        ? '#b45309'
        : visualProgress > 0.72
          ? mutedColor
          : color;
  const opacityFloor = styleId === 'blur' ? 0.28 : styleId === 'drift' || styleId === 'scramble' ? 1 : 0.12;
  const translateY = styleId === 'drift' ? visualProgress * 11 : 0;
  const translateX = styleId === 'blur' ? 0 : 0;
  const scaleY = 1;

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.text,
        {
          color: textColor,
          fontSize: size,
          lineHeight,
          opacity: styleId === 'drift' || styleId === 'scramble' ? 1 : Math.max(opacityFloor, 1 - visualProgress * 0.76),
          fontWeight: weight,
          letterSpacing: styleId === 'drift' ? visualProgress * 4.5 : 0,
          textShadowColor: styleId === 'ash' ? '#f59e0b' : 'transparent',
          textShadowOffset: { width: styleId === 'ash' ? visualProgress : 0, height: 0 },
          textShadowRadius: styleId === 'ash' ? visualProgress * 4 : styleId === 'blur' ? visualProgress * 5 : 0,
          transform: [{ translateX }, { translateY }, { scaleY }],
        },
      ]}>
      {renderedText}
    </Text>
  );
}

function computeTick(now: number, styleId: DecayStyle) {
  return Math.floor(now / (styleId === 'scramble' ? 1200 : styleId === 'ash' ? 1600 : 3000));
}

export const DecayText = memo(DecayTextInner, (prev, next) => {
  const prevTick = computeTick(prev.now, prev.styleId);
  const nextTick = computeTick(next.now, next.styleId);
  const prevProgress = Math.round(prev.progress * 50) / 50;
  const nextProgress = Math.round(next.progress * 50) / 50;

  return (
    prev.text === next.text &&
    prevProgress === nextProgress &&
    prev.styleId === next.styleId &&
    prev.seed === next.seed &&
    prev.color === next.color &&
    prev.mutedColor === next.mutedColor &&
    prev.size === next.size &&
    prev.lineHeight === next.lineHeight &&
    prev.weight === next.weight &&
    prev.numberOfLines === next.numberOfLines &&
    prevTick === nextTick
  );
});

const styles = StyleSheet.create({
  text: {
    letterSpacing: 0,
  },
});
