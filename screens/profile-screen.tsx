import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { AppBackgroundStyle } from '@/context/dhulo-store';
import { BACKGROUND_OPTIONS, THEME_IDS } from '@/utils/constants';
import { DHULO_THEMES, DhuloNote, ThemeId } from '@/lib/dhulo';
import { getNoteProgress } from '@/lib/dhulo';

type Props = {
  notes: DhuloNote[];
  onAvatarChange: () => void;
  onBackgroundStyleChange: (backgroundStyle: AppBackgroundStyle) => void;
  onBack: () => void;
  onProfileBioChange: (bio: string) => void;
  onProfileNameChange: (name: string) => void;
  onThemeChange: (themeId: ThemeId) => void;
  profileBio: string;
  profileAvatarUri?: string;
  profileInitial: string;
  profileName: string;
  selectedBackgroundStyle: AppBackgroundStyle;
  selectedThemeId: ThemeId;
  themeId: ThemeId;
};

export function ProfileScreen({
  notes,
  onAvatarChange,
  onBackgroundStyleChange,
  onBack,
  onProfileBioChange,
  onProfileNameChange,
  onThemeChange,
  profileBio,
  profileAvatarUri,
  profileInitial,
  profileName,
  selectedBackgroundStyle,
  selectedThemeId,
  themeId,
}: Props) {
  const theme = DHULO_THEMES[themeId];
  const now = Date.now();
  const goneCount = notes.filter((note) => getNoteProgress(note, now) >= 1).length;
  const wordCount = notes.reduce((total, note) => total + note.body.trim().split(/\s+/).filter(Boolean).length, 0);
  const preservedCount = notes.filter((note) => note.isPreserved).length;

  return (
    <AmbientBackground backgroundStyle={selectedBackgroundStyle} theme={theme}>
      <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back" accessibilityRole="button" onPress={onBack} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
            <MaterialIcons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.profileHero, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Pressable accessibilityLabel="Choose profile picture" accessibilityRole="button" onPress={onAvatarChange} style={[styles.avatarLarge, { backgroundColor: theme.secondary }]}>
              {profileAvatarUri ? (
                <Image source={{ uri: profileAvatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: theme.background }]}>{profileInitial || 'D'}</Text>
              )}
              <View style={[styles.avatarEdit, { backgroundColor: theme.text }]}>
                <MaterialIcons name="photo-camera" size={13} color={theme.background} />
              </View>
            </Pressable>
            <View style={styles.profileCopy}>
              <TextInput onChangeText={onProfileNameChange} style={[styles.nameInput, { color: theme.text }]} value={profileName} />
              <TextInput
                multiline
                onChangeText={onProfileBioChange}
                placeholder="A small note about this space"
                placeholderTextColor={theme.faint}
                style={[styles.bioInput, { color: theme.muted }]}
                value={profileBio}
              />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatTile label="Memories faded" theme={theme} value={`${goneCount}`} />
            <StatTile label="Words dissolved" theme={theme} value={`${wordCount}`} />
            <StatTile label="Notes held" theme={theme} value={`${notes.length}`} />
            <StatTile label="Notes kept" theme={theme} value={`${preservedCount}`} />
          </View>

          <Text style={[styles.sectionLabel, { color: theme.faint }]}>Personal themes</Text>
          <View style={styles.themeDeck}>
            {THEME_IDS.map((id) => {
              const option = DHULO_THEMES[id];
              const selected = id === selectedThemeId;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={id}
                  onPress={() => onThemeChange(id)}
                  style={[styles.themeTile, { backgroundColor: option.surface, borderColor: selected ? theme.accent : option.border }]}>
                  <View style={styles.themeTileTop}>
                    <View style={[styles.themeOrb, { backgroundColor: option.accent }]} />
                    <ThemeMiniPreview themeId={id} />
                  </View>
                  <Text style={[styles.themeName, { color: option.text }]}>{option.name}</Text>
                  <Text style={[styles.themeCaption, { color: option.muted }]}>{option.caption}</Text>
                  {selected ? <Text style={[styles.themeSelected, { color: option.accent }]}>Selected</Text> : null}
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, { color: theme.faint }]}>Backgrounds</Text>
          <View style={styles.backgroundDeck}>
            {BACKGROUND_OPTIONS.map((background) => {
              const selected = background.id === selectedBackgroundStyle;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={background.id}
                  onPress={() => onBackgroundStyleChange(background.id)}
                  style={[styles.backgroundTile, { backgroundColor: theme.surface, borderColor: selected ? theme.accent : theme.border }]}>
                  <BackgroundPreview backgroundStyle={background.id} themeId={themeId} />
                  <View style={styles.backgroundCopy}>
                    <Text style={[styles.backgroundName, { color: theme.text }]}>{background.name}</Text>
                    <Text style={[styles.backgroundCaption, { color: theme.muted }]}>{background.caption}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

function StatTile({ label, theme, value }: { label: string; theme: typeof DHULO_THEMES.obsidian; value: string }) {
  return (
    <View style={[styles.statTile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.statValue, { color: theme.text }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.faint }]}>{label}</Text>
    </View>
  );
}

function ThemeMiniPreview({ themeId }: { themeId: ThemeId }) {
  const option = DHULO_THEMES[themeId];

  return (
    <View style={[styles.themePreview, { backgroundColor: option.background }]}>
      <View style={[styles.previewSurface, { backgroundColor: option.surface }]} />
      <View style={[styles.previewAccent, { backgroundColor: option.accent }]} />
    </View>
  );
}

function BackgroundPreview({ backgroundStyle, themeId }: { backgroundStyle: AppBackgroundStyle; themeId: ThemeId }) {
  const theme = DHULO_THEMES[themeId];
  const marks = Array.from({ length: 7 }, (_, index) => index);

  return (
    <View style={[styles.backgroundPreview, { backgroundColor: theme.background }]}>
      {marks.map((mark) => (
        <View
          key={mark}
          style={[
            styles.previewMark,
            {
              backgroundColor: mark % 2 ? theme.secondary : theme.accent,
              borderRadius: backgroundStyle === 'garden' || backgroundStyle === 'orbit' || backgroundStyle === 'hearts' ? 999 : backgroundStyle === 'signal' ? 2 : 5,
              height:
                backgroundStyle === 'signal'
                  ? 3
                  : backgroundStyle === 'paper' || backgroundStyle === 'blocks'
                    ? 22
                    : backgroundStyle === 'mist'
                      ? 9
                      : backgroundStyle === 'hearts'
                        ? 14
                        : 12 + mark,
              left: `${8 + ((mark * 19) % 72)}%`,
              opacity: 0.2 + mark * 0.04,
              top: `${8 + ((mark * 13) % 72)}%`,
              transform: [{ rotate: `${backgroundStyle === 'signal' ? -12 : backgroundStyle === 'hearts' ? 45 : mark % 2 ? -8 : 8}deg` }],
              width:
                backgroundStyle === 'signal'
                  ? 44
                  : backgroundStyle === 'mist'
                    ? 40
                    : backgroundStyle === 'paper' || backgroundStyle === 'blocks'
                      ? 30
                      : backgroundStyle === 'hearts'
                        ? 14
                        : 16 + mark * 3,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarEdit: {
    alignItems: 'center',
    borderRadius: 999,
    bottom: 2,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 24,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarLarge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 72,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    width: 72,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  backgroundCaption: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 3,
  },
  backgroundCopy: {
    flex: 1,
  },
  backgroundDeck: {
    gap: 10,
  },
  backgroundName: {
    fontSize: 15,
    fontWeight: '900',
  },
  backgroundPreview: {
    borderRadius: 8,
    height: 66,
    overflow: 'hidden',
    position: 'relative',
    width: 92,
  },
  backgroundTile: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 88,
    padding: 10,
  },
  bioInput: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 5,
    minHeight: 46,
    padding: 0,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 44,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerSpacer: {
    height: 46,
    width: 46,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    padding: 0,
  },
  previewAccent: {
    borderRadius: 999,
    height: 8,
    marginTop: 6,
    width: '42%',
  },
  previewMark: {
    position: 'absolute',
  },
  previewSurface: {
    borderRadius: 6,
    height: 18,
    width: '72%',
  },
  profileCopy: {
    flex: 1,
  },
  profileHero: {
    alignItems: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 18,
  },
  safeArea: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statTile: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 102,
    padding: 13,
    width: '48%',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeCaption: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 5,
  },
  themeDeck: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeName: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 14,
  },
  themeOrb: {
    borderRadius: 999,
    height: 28,
    width: 28,
  },
  themePreview: {
    borderRadius: 8,
    height: 42,
    overflow: 'hidden',
    padding: 6,
    width: 58,
  },
  themeSelected: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 9,
    textTransform: 'uppercase',
  },
  themeTile: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 148,
    padding: 14,
    width: '48%',
  },
  themeTileTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
