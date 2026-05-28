import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DAY_VALUES, DURATION_ITEM_HEIGHT, HOUR_VALUES, MINUTE_VALUES } from '@/utils/constants';
import { durationToParts, partsToDuration } from '@/utils/note';
import { DhuloTheme } from '@/lib/dhulo';

const LOOP_COUNT = 9;
const CENTER_LOOP = Math.floor(LOOP_COUNT / 2);

type DurationWheelProps = {
  value: number;
  onChange: (duration: number) => void;
  theme: DhuloTheme;
};

export function DurationWheel({ onChange, theme, value }: DurationWheelProps) {
  const parts = useMemo(() => durationToParts(value), [value]);

  const setPart = useCallback(
    (key: 'days' | 'hours' | 'minutes', nextValue: number) => {
      onChange(partsToDuration({ ...parts, [key]: nextValue }));
    },
    [onChange, parts]
  );

  return (
    <View style={[styles.wheel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <DurationColumn label="Days" onChange={(days) => setPart('days', days)} theme={theme} value={parts.days} values={DAY_VALUES} />
      <DurationColumn label="Hours" onChange={(hours) => setPart('hours', hours)} theme={theme} value={parts.hours} values={HOUR_VALUES} />
      <DurationColumn label="Minutes" onChange={(minutes) => setPart('minutes', minutes)} theme={theme} value={parts.minutes} values={MINUTE_VALUES} />
    </View>
  );
}

type DurationColumnProps = {
  label: string;
  values: number[];
  value: number;
  onChange: (value: number) => void;
  theme: DhuloTheme;
};

export const DurationColumn = memo(function DurationColumn({ label, onChange, theme, value, values }: DurationColumnProps) {
  const scrollRef = useRef<ScrollView>(null);
  const loopedValues = useMemo(() => Array.from({ length: LOOP_COUNT }).flatMap(() => values), [values]);
  const selectedIndex = Math.max(0, values.indexOf(value));
  const centeredIndex = CENTER_LOOP * values.length + selectedIndex;

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: centeredIndex * DURATION_ITEM_HEIGHT, animated: false });
    });
  }, [centeredIndex]);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const rawIndex = Math.round(event.nativeEvent.contentOffset.y / DURATION_ITEM_HEIGHT);
      const normalizedIndex = ((rawIndex % values.length) + values.length) % values.length;
      const nextValue = values[normalizedIndex];

      if (typeof nextValue === 'number' && nextValue !== value) {
        onChange(nextValue);
      }

      scrollRef.current?.scrollTo({
        y: (CENTER_LOOP * values.length + normalizedIndex) * DURATION_ITEM_HEIGHT,
        animated: false,
      });
    },
    [onChange, value, values]
  );

  return (
    <View style={styles.column}>
      <Text style={[styles.label, { color: theme.faint }]}>{label}</Text>
      <ScrollView
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
        nestedScrollEnabled
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={DURATION_ITEM_HEIGHT}
        style={styles.list}>
        {loopedValues.map((item, index) => (
          <View
            key={`${label}-${index}-${item}`}
            style={[
              styles.item,
              {
                opacity: item === value ? 1 : 0.42,
              },
            ]}>
            <Text style={[styles.itemText, { color: item === value ? theme.text : theme.muted }]}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  column: {
    flex: 1,
  },
  item: {
    alignItems: 'center',
    borderRadius: 8,
    height: DURATION_ITEM_HEIGHT,
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 7,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  list: {
    borderRadius: 8,
    height: 168,
  },
  listContent: {
    paddingBottom: 64,
    paddingTop: 64,
  },
  wheel: {
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    height: 214,
    padding: 10,
  },
});
