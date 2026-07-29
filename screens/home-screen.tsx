import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FlashList } from '@shopify/flash-list';
import { Image as ExpoImage } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { memo, useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
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
  onOpenNote: (note: DhuloNote) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  profileAvatarUri?: string;
  profileInitial: string;
  resolvedThemeId: ThemeId;
};

type HomeFilter = 'all' | 'active' | 'preserved' | 'expired';
type HomeSort = 'ending' | 'newest';

const FILTERS: { id: HomeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'preserved', label: 'Preserved' },
  { id: 'expired', label: 'Expired' },
];
const brandMark = require('@/assets/images/brand-mark.png');

export const HomeScreen = memo(function HomeScreen({
  appBackgroundStyle,
  notes,
  onCreateNote,
  onOpenNote,
  onOpenProfile,
  onOpenSettings,
  profileAvatarUri,
  profileInitial,
  resolvedThemeId,
}: Props) {
  const now = useGlobalTimer(HOME_TIMER_MS);
  const theme = DHULO_THEMES[resolvedThemeId];
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<HomeFilter>('all');
  const [sort, setSort] = useState<HomeSort>('ending');
  const columnCount = width >= 720 ? 2 : 1;

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visible = notes.filter((note) => {
      const progress = getNoteProgress(note, now);
      const matchesQuery = !normalizedQuery || `${note.title} ${note.body}`.toLowerCase().includes(normalizedQuery);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && progress < 1 && !note.isPreserved && !note.isDraft) ||
        (filter === 'preserved' && note.isPreserved && !note.isDraft) ||
        (filter === 'expired' && progress >= 1);
      return matchesQuery && matchesFilter;
    });

    return [...visible].sort((a, b) => {
      if (sort === 'newest') {
        return b.createdAt - a.createdAt;
      }

      const aExpiry = a.isPreserved ? Number.POSITIVE_INFINITY : a.createdAt + a.durationMinutes * 60_000;
      const bExpiry = b.isPreserved ? Number.POSITIVE_INFINITY : b.createdAt + b.durationMinutes * 60_000;
      return aExpiry - bExpiry;
    });
  }, [filter, notes, now, query, sort]);

  const goneCount = useMemo(() => notes.filter((note) => getNoteProgress(note, now) >= 1).length, [notes, now]);
  const aliveCount = notes.length - goneCount;

  const renderNote = useCallback(
    ({ item }: { item: DhuloNote }) => <NoteCard note={item} now={now} onPress={onOpenNote} />,
    [now, onOpenNote]
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
            <View style={styles.brandLockup}>
              <ExpoImage contentFit="contain" source={brandMark} style={styles.brandMark} />
              <Text style={[styles.title, { color: theme.text }]}>Dhulo</Text>
            </View>
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
          {query ? (
            <Pressable accessibilityLabel="Clear search" hitSlop={10} onPress={() => setQuery('')}>
              <MaterialIcons color={theme.faint} name="close" size={19} />
            </Pressable>
          ) : null}
        </View>

        {notes.length ? (
          <View>
            <ScrollView contentContainerStyle={styles.filters} horizontal showsHorizontalScrollIndicator={false}>
              {FILTERS.map((option) => {
                const selected = filter === option.id;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={option.id}
                    onPress={() => setFilter(option.id)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selected ? theme.text : theme.surface,
                        borderColor: selected ? theme.text : theme.border,
                      },
                    ]}>
                    <Text style={[styles.filterText, { color: selected ? theme.background : theme.muted }]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                accessibilityLabel={`Sort by ${sort === 'ending' ? 'newest' : 'ending soon'}`}
                accessibilityRole="button"
                onPress={() => setSort((current) => (current === 'ending' ? 'newest' : 'ending'))}
                style={[styles.sortChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <MaterialIcons color={theme.muted} name="sort" size={16} />
                <Text style={[styles.filterText, { color: theme.muted }]}>
                  {sort === 'ending' ? 'Ending soon' : 'Newest'}
                </Text>
              </Pressable>
            </ScrollView>
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, { color: theme.faint }]}>{aliveCount} active</Text>
              <View style={[styles.statusDot, { backgroundColor: theme.border }]} />
              <Text style={[styles.statusText, { color: theme.faint }]}>{goneCount} expired</Text>
            </View>
          </View>
        ) : null}

        <FlashList
          ListEmptyComponent={
            <EmptyState filtered={Boolean(query.trim()) || filter !== 'all'} onCreate={onCreateNote} theme={theme} />
          }
          contentContainerStyle={styles.listContent}
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          key={`notes-${columnCount}`}
          numColumns={columnCount}
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

function EmptyState({
  filtered,
  onCreate,
  theme,
}: {
  filtered: boolean;
  onCreate: () => void;
  theme: typeof DHULO_THEMES.obsidian;
}) {
  return (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyBook, { backgroundColor: theme.surface }]}>
        <View style={[styles.emptyLine, { backgroundColor: theme.border, width: '70%' }]} />
        <View style={[styles.emptyLine, { backgroundColor: theme.border, width: '52%' }]} />
        <View style={[styles.emptyLine, { backgroundColor: theme.border, width: '38%' }]} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {filtered ? 'Nothing matches' : 'Nothing here lasts forever'}
      </Text>
      <Text style={[styles.emptyText, { color: theme.muted }]}>
        {filtered ? 'Try another filter or a softer word.' : 'Write freely, then choose how long the thought needs to stay.'}
      </Text>
      {!filtered ? (
        <Pressable
          accessibilityRole="button"
          onPress={onCreate}
          style={({ pressed }) => [
            styles.emptyButton,
            { backgroundColor: theme.text, opacity: pressed ? 0.72 : 1 },
          ]}>
          <MaterialIcons color={theme.background} name="edit" size={18} />
          <Text style={[styles.emptyButtonText, { color: theme.background }]}>Write a note</Text>
        </Pressable>
      ) : null}
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
    borderCurve: 'continuous',
    borderRadius: 24,
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
  brandLockup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  brandMark: {
    height: 34,
    width: 34,
  },
  emptyButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 17,
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 19,
    paddingVertical: 13,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '900',
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
  filterChip: {
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '800',
  },
  filters: {
    gap: 8,
    paddingHorizontal: 22,
    paddingTop: 14,
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
    borderCurve: 'continuous',
    borderRadius: 18,
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
  sortChip: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
