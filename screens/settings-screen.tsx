import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { ComponentProps, ReactNode } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { DecayPreview } from '@/components/decay-preview';
import { DecayStyle, DHULO_THEMES, ThemeId } from '@/lib/dhulo';
import { DURATION_PRESETS } from '@/utils/constants';
import { formatDuration } from '@/utils/note';

type Props = {
  ambientMotionEnabled: boolean;
  autoEraseEnabled: boolean;
  defaultDuration: number;
  defaultStyle: DecayStyle;
  hapticsEnabled: boolean;
  onAutoEraseChange: (enabled: boolean) => void;
  onAmbientMotionChange: (enabled: boolean) => void;
  onBack: () => void;
  onDefaultDurationChange: (duration: number) => void;
  onDefaultStyleChange: (style: DecayStyle) => void;
  onHapticsChange: (enabled: boolean) => void;
  onGuidePress: () => void;
  onPersonalizationPress: () => void;
  onSoundChange: (enabled: boolean) => void;
  soundEnabled: boolean;
  themeId: ThemeId;
};

export function SettingsScreen({
  ambientMotionEnabled,
  autoEraseEnabled,
  defaultDuration,
  defaultStyle,
  hapticsEnabled,
  onAutoEraseChange,
  onAmbientMotionChange,
  onBack,
  onDefaultDurationChange,
  onDefaultStyleChange,
  onHapticsChange,
  onGuidePress,
  onPersonalizationPress,
  onSoundChange,
  soundEnabled,
  themeId,
}: Props) {
  const theme = DHULO_THEMES[themeId];
  async function shareApp() {
    await Share.share({
      message: 'I have been using Dhulo to write things down without keeping them forever.',
    });
  }

  function showPrivacy() {
    Alert.alert(
      'Privacy and local storage',
      'Dhulo stores notes, settings, profile details, and private copies of attached photos locally on this device. Nothing is uploaded by this app. Deleting the app or clearing app data removes this local content.'
    );
  }

  return (
    <AmbientBackground theme={theme}>
      <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back" accessibilityRole="button" onPress={onBack} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
            <MaterialIcons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.heroIcon, { backgroundColor: theme.elevated }]}>
              <MaterialIcons name="tune" size={23} color={theme.accent} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroTitle, { color: theme.text }]}>Set Dhulo up your way</Text>
              <Text style={[styles.heroText, { color: theme.muted }]}>These are only defaults. You can change the time, fade and colour on every note.</Text>
            </View>
          </View>

          <Section title="New notes" theme={theme}>
            <View style={styles.settingCopy}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>How long should they stay?</Text>
              <Text style={[styles.settingHint, { color: theme.muted }]}>New notes start with this amount of time.</Text>
            </View>
            <DurationPresets onChange={onDefaultDurationChange} theme={theme} value={defaultDuration} />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.settingCopy}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>How should the words fade?</Text>
              <Text style={[styles.settingHint, { color: theme.muted }]}>This is the starting style for a new note.</Text>
            </View>
            <DecayPreview onSelect={onDefaultStyleChange} selectedStyle={defaultStyle} theme={theme} />
          </Section>

          <Section title="After a note expires" theme={theme}>
            <ToggleRow label="Remove it automatically" onValueChange={onAutoEraseChange} theme={theme} value={autoEraseEnabled} />
            <Text style={[styles.helperText, { color: theme.muted }]}>
              {autoEraseEnabled ? 'Dhulo plays the ending and removes the note. There is no bin or undo.' : 'The note waits at zero until you tap Release for good. It still cannot be reopened.'}
            </Text>
          </Section>

          <Section title="Feel and sound" theme={theme}>
            <ToggleRow label="Gentle tap feedback" onValueChange={onHapticsChange} theme={theme} value={hapticsEnabled} />
            <ToggleRow label="Sound when a note leaves" onValueChange={onSoundChange} theme={theme} value={soundEnabled} />
            <ToggleRow label="Slow wallpaper movement" onValueChange={onAmbientMotionChange} theme={theme} value={ambientMotionEnabled} />
          </Section>

          <Section title="Your space" theme={theme}>
            <ActionRow icon="palette" label="Colours and wallpaper" onPress={onPersonalizationPress} theme={theme} />
            <ActionRow icon="touch-app" label="Run the tutorial again" onPress={onGuidePress} theme={theme} />
            <ActionRow icon="ios-share" label="Share Dhulo" onPress={shareApp} theme={theme} />
            <ActionRow icon="privacy-tip" label="What stays on this device" onPress={showPrivacy} theme={theme} />
          </Section>

          <View style={[styles.about, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.aboutIcon, { backgroundColor: theme.elevated }]}>
              <MaterialIcons name="lock-outline" size={20} color={theme.accent} />
            </View>
            <View style={styles.aboutCopy}>
              <Text style={[styles.aboutTitle, { color: theme.text }]}>Private by default</Text>
              <Text style={[styles.aboutText, { color: theme.muted }]}>
                Your writing and attached photos stay on this device. Dhulo does not upload them or keep a hidden archive.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

function DurationPresets({
  onChange,
  theme,
  value,
}: {
  onChange: (minutes: number) => void;
  theme: typeof DHULO_THEMES.obsidian;
  value: number;
}) {
  return (
    <View style={styles.presetGrid}>
      {DURATION_PRESETS.map((minutes) => {
        const selected = minutes === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={minutes}
            onPress={() => onChange(minutes)}
            style={({ pressed }) => [
              styles.preset,
              {
                backgroundColor: selected ? theme.text : theme.elevated,
                borderColor: selected ? theme.text : theme.border,
                opacity: pressed ? 0.68 : 1,
              },
            ]}>
            <Text style={[styles.presetText, { color: selected ? theme.background : theme.text }]}>{formatDuration(minutes)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Section({ children, theme, title }: { children: ReactNode; theme: typeof DHULO_THEMES.obsidian; title: string }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.faint }]}>{title}</Text>
      <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>{children}</View>
    </View>
  );
}

function RowIcon({ icon, theme }: { icon: ComponentProps<typeof MaterialIcons>['name']; theme: typeof DHULO_THEMES.obsidian }) {
  return (
    <View style={[styles.rowIcon, { backgroundColor: theme.elevated }]}>
      <MaterialIcons name={icon} size={17} color={theme.text} />
    </View>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  theme: typeof DHULO_THEMES.obsidian;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.row, { borderBottomColor: theme.border }]}>
      <RowIcon icon={icon} theme={theme} />
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      <MaterialIcons name="chevron-right" size={22} color={theme.faint} />
    </Pressable>
  );
}

function ToggleRow({
  label,
  onValueChange,
  theme,
  value,
}: {
  label: string;
  onValueChange: (enabled: boolean) => void;
  theme: typeof DHULO_THEMES.obsidian;
  value: boolean;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        onValueChange={onValueChange}
        thumbColor={theme.mode === 'dark' ? theme.text : undefined}
        trackColor={{ false: theme.border, true: theme.accent }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  about: {
    alignItems: 'flex-start',
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  aboutCopy: {
    flex: 1,
  },
  aboutIcon: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  aboutText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 8,
  },
  aboutTitle: {
    fontSize: 21,
    fontWeight: '900',
  },
  content: {
    gap: 20,
    padding: 20,
    paddingBottom: 44,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  group: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  helperText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: -5,
  },
  hero: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  heroCopy: {
    flex: 1,
  },
  heroIcon: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  heroText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 3,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
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
  notice: {
    alignItems: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 21,
  },
  preset: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    minWidth: '30%',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '900',
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    minHeight: 50,
    paddingBottom: 8,
  },
  rowIcon: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  settingCopy: {
    gap: 3,
  },
  settingHint: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  safeArea: {
    flex: 1,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
