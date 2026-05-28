import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import { memo, useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { NoteCard } from '@/components/note-card';
import { AppBackgroundStyle } from '@/context/dhulo-store';
import { useGlobalTimer } from '@/hooks/use-global-timer';
import { DHULO_THEMES, DhuloNote, getNoteProgress, ThemeId } from '@/lib/dhulo';
import { HOME_TIMER_MS } from '@/utils/animation';

type Props = {
  appBackgroundStyle: AppBackgroundStyle;
  notes: DhuloNote[];
  onCreateNote: () => void;
  onDestroyNote: (note: DhuloNote) => void;
  onOpenNote: (note: DhuloNote) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  profileAvatarUri?: string;
  profileInitial: string;
  resolvedThemeId: ThemeId;
};

export const HomeScreen = memo(function HomeScreen({
  appBackgroundStyle,
  notes,
  onCreateNote,
  onDestroyNote,
  onOpenNote,
  onOpenProfile,
  onOpenSettings,
  profileAvatarUri,
  profileInitial,
  resolvedThemeId,
}: Props) {
  const now = useGlobalTimer(HOME_TIMER_MS);
  const theme = DHULO_THEMES[resolvedThemeId];
  const [query, setQuery] = useState('');

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return notes;
    }

    return notes.filter((note) => `${note.title} ${note.body}`.toLowerCase().includes(normalizedQuery));
  }, [notes, query]);

  const goneCount = useMemo(() => notes.filter((note) => getNoteProgress(note, now) >= 1).length, [notes, now]);
  const aliveCount = notes.length - goneCount;

  const renderNote = useCallback(
    ({ item }: { item: DhuloNote }) => <NoteCard note={item} now={now} onDestroy={onDestroyNote} onPress={onOpenNote} />,
    [now, onDestroyNote, onOpenNote]
  );

  return (
    <AmbientBackground backgroundStyle={appBackgroundStyle} theme={theme}>
      <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Open profile" accessibilityRole="button" onPress={onOpenProfile} style={[styles.avatar, { backgroundColor: theme.secondary }]}>
            {profileAvatarUri ? <Image source={{ uri: profileAvatarUri }} style={styles.avatarImage} /> : <Text style={[styles.avatarText, { color: theme.background }]}>{profileInitial || 'D'}</Text>}
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: theme.text }]}>Dhulo</Text>
            <Text style={[styles.subtitle, { color: theme.faint }]}>Temporary journal</Text>
          </View>
          <Pressable accessibilityLabel="Open settings" accessibilityRole="button" onPress={onOpenSettings} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
            <MaterialIcons name="settings" size={22} color={theme.text} />
          </Pressable>
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <MaterialIcons name="search" size={22} color={theme.faint} />
          <TextInput
            onChangeText={setQuery}
            placeholder="Search notes"
            placeholderTextColor={theme.faint}
            style={[styles.searchInput, { color: theme.text }]}
            value={query}
          />
        </View>

        {notes.length ? (
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: theme.faint }]}>{aliveCount} fading</Text>
            <View style={[styles.statusDot, { backgroundColor: theme.border }]} />
            <Text style={[styles.statusText, { color: theme.faint }]}>{goneCount} gone</Text>
          </View>
        ) : null}

        <FlashList
          ListEmptyComponent={<EmptyState hasQuery={Boolean(query.trim())} theme={theme} />}
          contentContainerStyle={styles.listContent}
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderNote}
          showsVerticalScrollIndicator={false}
        />

        <Pressable
          accessibilityLabel="Create note"
          accessibilityRole="button"
          onPress={onCreateNote}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: theme.mode === 'light' ? theme.text : theme.accent,
              opacity: pressed ? 0.72 : 1,
              shadowColor: theme.shadow,
            },
          ]}>
          <MaterialIcons name="add" size={34} color={theme.background} />
        </Pressable>
      </SafeAreaView>
    </AmbientBackground>
  );
});

function EmptyState({ hasQuery, theme }: { hasQuery: boolean; theme: typeof DHULO_THEMES.obsidian }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyBook, { backgroundColor: theme.surface }]}>
        <View style={[styles.emptyLine, { backgroundColor: theme.border, width: '70%' }]} />
        <View style={[styles.emptyLine, { backgroundColor: theme.border, width: '52%' }]} />
        <View style={[styles.emptyLine, { backgroundColor: theme.border, width: '38%' }]} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{hasQuery ? 'Nothing found' : 'Nothing here lasts forever'}</Text>
      <Text style={[styles.emptyText, { color: theme.muted }]}>{hasQuery ? 'Try a softer word.' : 'Write freely, then let the note decide how long it needs to stay.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 44,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
  },
  emptyBook: {
    borderRadius: 8,
    gap: 13,
    height: 150,
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: 132,
  },
  emptyLine: {
    borderRadius: 999,
    height: 7,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 22,
    textAlign: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 460,
    paddingHorizontal: 40,
  },
  fab: {
    alignItems: 'center',
    borderRadius: 999,
    bottom: 34,
    height: 66,
    justifyContent: 'center',
    position: 'absolute',
    right: 26,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    width: 66,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  listContent: {
    paddingBottom: 116,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  safeArea: {
    flex: 1,
  },
  searchBar: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    height: 54,
    marginHorizontal: 22,
    marginTop: 22,
    paddingHorizontal: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
  statusDot: {
    borderRadius: 999,
    height: 4,
    width: 4,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
  },
  titleBlock: {
    alignItems: 'center',
  },
});
