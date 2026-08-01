import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { ComponentProps, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { DecayImage } from '@/components/dhulo/decay-image';
import { DecayText } from '@/components/dhulo/decay-text';
import { useSettings } from '@/context/dhulo-store';
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
  onDuplicate: () => void;
  onExtend: (minutes: number) => void;
  onPreserve: () => void;
  onQuickBurn: () => void;
};

export function ReaderScreen({
  note,
  onBack,
  onContinue,
  onDelete,
  onDuplicate,
  onExtend,
  onPreserve,
  onQuickBurn,
}: Props) {
  const now = useGlobalTimer(READER_TIMER_MS);
  const { hapticsEnabled } = useSettings();
  const theme = DHULO_THEMES[note.themeId];
  const { isGone, progress, remainingLabel } = useNoteDecay(note, now);
  const destroyCopy = getDestroyCopy(note.decayStyle);
  const animationFrame = useRef<number | null>(null);
  const lastVisualUpdate = useRef(0);
  const [fastForwardProgress, setFastForwardProgress] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const displayProgress = fastForwardProgress ?? progress;
  const isFastForwarding = fastForwardProgress !== null;
  const displayGone = isGone || displayProgress >= 1;
  const displayRemaining = isFastForwarding
    ? `Moving ahead · ${Math.round(displayProgress * 100)}%`
    : displayGone
      ? 'Time is up'
      : remainingLabel;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => listener.remove();
  }, []);

  useEffect(
    () => () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    },
    []
  );

  function cancelFastForward() {
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    setFastForwardProgress(null);
  }

  function startFastForward() {
    if (isFastForwarding || isGone) {
      return;
    }

    const startedAt = performance.now();
    const startingProgress = progress;
    const duration = reduceMotion ? 650 : Math.max(2600, 4400 * (1 - startingProgress));
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    }

    const advance = (timestamp: number) => {
      const elapsed = Math.min(1, (timestamp - startedAt) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const nextProgress = startingProgress + (1 - startingProgress) * eased;
      if (timestamp - lastVisualUpdate.current >= 32 || elapsed >= 1) {
        lastVisualUpdate.current = timestamp;
        setFastForwardProgress(nextProgress);
      }

      if (elapsed < 1) {
        animationFrame.current = requestAnimationFrame(advance);
        return;
      }

      animationFrame.current = null;
      setFastForwardProgress(null);
      onQuickBurn();
      if (hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
      }
    };

    animationFrame.current = requestAnimationFrame(advance);
  }

  function shareNote() {
    Share.share({
      message: [note.title, note.body].filter(Boolean).join('\n\n'),
      title: note.title,
    }).catch(() => undefined);
  }

  return (
    <AmbientBackground theme={theme}>
      <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back" accessibilityRole="button" onPress={onBack} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
            <MaterialIcons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{getDecayLabel(note.decayStyle)}</Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.date, { color: theme.faint }]}>{displayGone ? 'READY TO REMOVE' : formatTimestamp(note.createdAt)}</Text>
          <Text style={[styles.title, { color: theme.text }]}>{displayGone ? 'Nothing to bring back' : note.title}</Text>
          <Text accessibilityLiveRegion="polite" style={[styles.remaining, { color: theme.muted }]}>
            {displayRemaining}
          </Text>
          <View style={[styles.progressRail, { backgroundColor: theme.surface }]}>
            <View style={[styles.progressFill, { backgroundColor: displayGone ? theme.secondary : theme.accent, width: `${displayProgress * 100}%` }]} />
          </View>

          {displayGone ? (
            <View style={[styles.gonePage, { borderColor: theme.border }]}>
              <View style={[styles.goneRule, { backgroundColor: theme.border }]} />
              <View style={[styles.goneRule, { backgroundColor: theme.border, width: '61%' }]} />
              <View style={[styles.goneRule, { backgroundColor: theme.border, width: '34%' }]} />
            </View>
          ) : (
            <View style={styles.page}>
              <DecayImage accent={theme.accent} progress={displayProgress} styleId={note.decayStyle} surface={theme.surface} uri={note.imageUri} />
              <DecayText
                color={theme.text}
                lineHeight={30}
                mutedColor={theme.faint}
                now={now}
                progress={displayProgress}
                seed={`${note.id}-reader`}
                size={18}
                styleId={note.decayStyle}
                text={note.body || 'This note was an image.'}
              />
            </View>
          )}

          {displayGone ? (
            <View style={[styles.expiredCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.expiredIcon, { backgroundColor: theme.elevated }]}>
                <MaterialIcons color={theme.secondary} name="hourglass-disabled" size={23} />
              </View>
              <View style={styles.expiredCopy}>
                <Text style={[styles.expiredTitle, { color: theme.text }]}>This note has expired</Text>
                <Text style={[styles.expiredText, { color: theme.muted }]}>
                  There is no undo from here. Release it when you are ready to let it leave this device.
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            {displayGone ? (
              <ActionButton filled icon={destroyCopy.icon} label="Release for good" onPress={onDelete} theme={theme} />
            ) : note.isPreserved ? (
              <ActionButton icon="play-arrow" label="Resume clock" onPress={onContinue} theme={theme} />
            ) : (
              <ActionButton icon="pause" label="Put on hold" onPress={onPreserve} theme={theme} />
            )}
            {!displayGone ? (
              <ActionButton
                icon={isFastForwarding ? 'close' : 'fast-forward'}
                label={isFastForwarding ? 'Cancel fast-forward' : 'Decay now'}
                onPress={isFastForwarding ? cancelFastForward : startFastForward}
                theme={theme}
              />
            ) : null}
          </View>

          {!displayGone && !isFastForwarding ? (
            <View style={styles.quickActions}>
              <Text style={[styles.quickLabel, { color: theme.faint }]}>MORE TIME</Text>
              <View style={styles.quickRow}>
                <MiniAction label="+1 hour" onPress={() => onExtend(60)} theme={theme} />
                <MiniAction label="+1 day" onPress={() => onExtend(1440)} theme={theme} />
                <MiniAction label="Duplicate" onPress={onDuplicate} theme={theme} />
                <MiniAction label="Share" onPress={shareNote} theme={theme} />
              </View>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

function MiniAction({
  label,
  onPress,
  theme,
}: {
  label: string;
  onPress: () => void;
  theme: typeof DHULO_THEMES.obsidian;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.miniAction,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.65 : 1,
        },
      ]}>
      <Text style={[styles.miniActionText, { color: theme.text }]}>{label}</Text>
    </Pressable>
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
  expiredCard: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    marginTop: 20,
    padding: 15,
  },
  expiredCopy: {
    flex: 1,
    gap: 3,
  },
  expiredIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  expiredText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  expiredTitle: {
    fontSize: 16,
    fontWeight: '900',
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
  gonePage: {
    borderCurve: 'continuous',
    borderRadius: 4,
    borderWidth: 1,
    gap: 14,
    marginTop: 18,
    minHeight: 220,
    opacity: 0.62,
    padding: 28,
  },
  goneRule: {
    borderRadius: 99,
    height: 5,
    width: '78%',
  },
  miniAction: {
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  miniActionText: {
    fontSize: 12,
    fontWeight: '800',
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
  quickActions: {
    gap: 9,
    marginTop: 24,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
