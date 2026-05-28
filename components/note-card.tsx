import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { memo, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { DecayText } from '@/components/dhulo/decay-text';
import { useNoteDecay } from '@/hooks/use-note-decay';
import { DHULO_THEMES, DhuloNote, getPreviewTitle } from '@/lib/dhulo';
import { getDecayLabel, getDestroyCopy } from '@/utils/note';

type Props = {
  note: DhuloNote;
  now: number;
  onDestroy: (note: DhuloNote) => void;
  onPress: (note: DhuloNote) => void;
};

function NoteCardInner({ note, now, onDestroy, onPress }: Props) {
  const theme = DHULO_THEMES[note.themeId];
  const { isGone, progress, remainingLabel } = useNoteDecay(note, now);
  const visualProgress = Math.round(progress * 20) / 20;
  const [imageFailed, setImageFailed] = useState(false);
  const previewTitle = useMemo(() => getPreviewTitle(note, now), [note, now]);
  const destroyCopy = getDestroyCopy(note.decayStyle);
  const bodyLines = note.imageUri && !imageFailed ? 3 : note.body.length > 120 ? 7 : 5;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(note)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.82 : isGone ? 0.68 : 1,
          shadowColor: theme.shadow,
        },
      ]}>
      {note.imageUri && !imageFailed ? (
        <Image
          blurRadius={note.decayStyle === 'blur' ? visualProgress * 6 : 0}
          onError={() => setImageFailed(true)}
          source={{ uri: note.imageUri }}
          style={[styles.image, { opacity: Math.max(0.18, 1 - visualProgress * 0.66) }]}
        />
      ) : null}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
            {previewTitle || ' '}
          </Text>
          <View style={[styles.decayRing, { borderColor: theme.border }]}>
            <View
              style={[
                styles.decayDot,
                {
                  backgroundColor: note.decayStyle === 'ash' ? '#f97316' : note.decayStyle === 'blur' ? theme.secondary : theme.accent,
                  opacity: 0.35 + visualProgress * 0.65,
                  transform: [{ scale: 0.74 + visualProgress * 0.6 }],
                },
              ]}
            />
          </View>
        </View>

        <DecayText
          color={theme.muted}
          lineHeight={20}
          mutedColor={theme.faint}
          now={now}
          numberOfLines={bodyLines}
          progress={visualProgress}
          seed={`${note.id}-card`}
          size={13}
          styleId={note.decayStyle}
          text={note.body || (imageFailed ? 'Image could not be loaded.' : 'Image note')}
        />

        <View style={styles.footer}>
          <View style={[styles.tag, { backgroundColor: theme.elevated }]}>
            <Text style={[styles.tagText, { color: theme.text }]}>{getDecayLabel(note.decayStyle)}</Text>
          </View>
          <Text style={[styles.remaining, { color: theme.faint }]}>{remainingLabel}</Text>
        </View>
      </View>

      {isGone ? (
        <View style={[styles.goneOverlay, { backgroundColor: `${theme.surface}E8` }]}>
          <View style={[styles.goneIcon, { backgroundColor: theme.text }]}>
            <MaterialIcons name="lock" size={18} color={theme.background} />
          </View>
          <Text style={[styles.goneText, { color: theme.text }]}>Gone</Text>
          <Pressable
            accessibilityLabel={destroyCopy.action}
            accessibilityRole="button"
            onPress={(event) => {
              event.stopPropagation();
              onDestroy(note);
            }}
            style={[styles.destroyButton, { backgroundColor: theme.text }]}>
            <MaterialIcons name={destroyCopy.icon} size={16} color={theme.background} />
            <Text style={[styles.destroyText, { color: theme.background }]}>{destroyCopy.shortAction}</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

export const NoteCard = memo(NoteCardInner, (prev, next) => {
  const prevMinute = Math.floor(prev.now / 60000);
  const nextMinute = Math.floor(next.now / 60000);

  return (
    prev.note === next.note &&
    prev.onDestroy === next.onDestroy &&
    prev.onPress === next.onPress &&
    prevMinute === nextMinute
  );
});

const styles = StyleSheet.create({
  body: {
    gap: 10,
    padding: 14,
  },
  card: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    minHeight: 148,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  decayDot: {
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  decayRing: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginTop: 1,
    width: 24,
  },
  destroyButton: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  destroyText: {
    fontSize: 12,
    fontWeight: '900',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  goneIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  goneOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goneText: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 10,
  },
  image: {
    height: 132,
    width: '100%',
  },
  remaining: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 21,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
});
