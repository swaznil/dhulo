import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { ComponentProps } from 'react';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { DecayImage } from '@/components/dhulo/decay-image';
import { DecayText } from '@/components/dhulo/decay-text';
import { useGlobalTimer } from '@/hooks/use-global-timer';
import { DHULO_THEMES, DhuloNote } from '@/lib/dhulo';
import { READER_TIMER_MS } from '@/utils/animation';
import { formatTimestamp, getDestroyCopy, getDecayLabel } from '@/utils/note';
import { useNoteDecay } from '@/hooks/use-note-decay';

type Props = {
  note: DhuloNote;
  onBack: () => void;
  onContinue: () => void;
  onDelete: () => void;
  onPreserve: () => void;
  onQuickBurn: () => void;
};

export function ReaderScreen({ note, onBack, onContinue, onDelete, onPreserve, onQuickBurn }: Props) {
  const now = useGlobalTimer(READER_TIMER_MS);
  const theme = DHULO_THEMES[note.themeId];
  const { isGone, progress, remainingLabel } = useNoteDecay(note, now);
  const destroyCopy = getDestroyCopy(note.decayStyle);

  return (
    <AmbientBackground theme={theme}>
      <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back" accessibilityRole="button" onPress={onBack} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
            <MaterialIcons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{getDecayLabel(note.decayStyle)}</Text>
          {isGone ? (
            <Pressable accessibilityLabel={destroyCopy.action} accessibilityRole="button" onPress={onDelete} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
              <MaterialIcons name={destroyCopy.icon} size={20} color={theme.text} />
            </Pressable>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.date, { color: theme.faint }]}>{formatTimestamp(note.createdAt)}</Text>
          <Text style={[styles.title, { color: theme.text }]}>{note.title}</Text>
          <Text style={[styles.remaining, { color: theme.muted }]}>{remainingLabel}</Text>
          <View style={[styles.progressRail, { backgroundColor: theme.surface }]}>
            <View style={[styles.progressFill, { backgroundColor: isGone ? theme.secondary : theme.accent, width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.page}>
            <DecayImage accent={theme.accent} progress={progress} styleId={note.decayStyle} surface={theme.surface} uri={note.imageUri} />
            <DecayText
              color={theme.text}
              lineHeight={30}
              mutedColor={theme.faint}
              now={now}
              progress={progress}
              seed={`${note.id}-reader`}
              size={18}
              styleId={note.decayStyle}
              text={note.body || 'This memory was kept as an image.'}
            />
          </View>

          <View style={styles.actions}>
            {note.isPreserved ? (
              <ActionButton icon="play-arrow" label="Continue" onPress={onContinue} theme={theme} />
            ) : (
              <ActionButton icon="pause" label="Preserve" onPress={onPreserve} theme={theme} />
            )}
            {!isGone ? <ActionButton icon="hourglass-bottom" label="Decay now" onPress={onQuickBurn} theme={theme} /> : null}
            {isGone ? <ActionButton filled icon={destroyCopy.icon} label={destroyCopy.shortAction} onPress={onDelete} theme={theme} /> : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

function ActionButton({
  filled,
  icon,
  label,
  onPress,
  theme,
}: {
  filled?: boolean;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  theme: typeof DHULO_THEMES.obsidian;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.action,
        {
          backgroundColor: filled ? theme.text : theme.surface,
          borderColor: filled ? theme.text : theme.border,
        },
      ]}>
      <MaterialIcons name={icon} size={18} color={filled ? theme.background : theme.text} />
      <Text style={[styles.actionText, { color: filled ? theme.background : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 22,
  },
  content: {
    padding: 22,
    paddingBottom: 50,
  },
  date: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  page: {
    marginTop: 16,
    minHeight: 280,
  },
  progressFill: {
    height: '100%',
  },
  progressRail: {
    borderRadius: 999,
    height: 8,
    marginTop: 18,
    overflow: 'hidden',
  },
  remaining: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 7,
  },
  safeArea: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 40,
  },
});
