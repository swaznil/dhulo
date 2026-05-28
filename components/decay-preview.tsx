import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DecayText } from '@/components/dhulo/decay-text';
import { useGlobalTimer } from '@/hooks/use-global-timer';
import { DECAY_OPTIONS, DecayStyle, DhuloTheme } from '@/lib/dhulo';
import { getDecayLabel } from '@/utils/note';

type Props = {
  selectedStyle: DecayStyle;
  onSelect: (style: DecayStyle) => void;
  theme: DhuloTheme;
};

export const DecayPreview = memo(function DecayPreview({ onSelect, selectedStyle, theme }: Props) {
  const now = useGlobalTimer(900);
  const phase = (now % 4200) / 4200;
  const previewProgress = phase < 0.72 ? phase / 0.72 : 1 - (phase - 0.72) / 0.28;

  return (
    <View style={styles.grid}>
      {DECAY_OPTIONS.map((option) => {
        const selected = option.id === selectedStyle;

        return (
          <Pressable
            accessibilityRole="button"
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[
              styles.card,
              {
                backgroundColor: selected ? theme.elevated : theme.surface,
                borderColor: selected ? theme.accent : theme.border,
              },
            ]}>
            <Text style={[styles.name, { color: theme.text }]}>{getDecayLabel(option.id)}</Text>
            <Text style={[styles.caption, { color: theme.muted }]} numberOfLines={2}>
              {option.caption}
            </Text>
            <View style={[styles.previewTrack, { backgroundColor: theme.elevated }]}>
              <View style={[styles.previewFill, { backgroundColor: theme.accent, width: `${Math.max(8, previewProgress * 100)}%` }]} />
            </View>
            <DecayText color={theme.muted} lineHeight={18} mutedColor={theme.faint} now={now} numberOfLines={1} progress={previewProgress} seed={`${option.id}-preview`} size={13} styleId={option.id} text="memory fading" />
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 94,
    padding: 13,
    width: '48%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  caption: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginBottom: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 6,
  },
  previewFill: {
    borderRadius: 999,
    height: '100%',
  },
  previewTrack: {
    borderRadius: 999,
    height: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
});
