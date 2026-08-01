import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import { Image as ExpoImage } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { ComponentProps, ReactNode } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { DecayPreview } from '@/components/decay-preview';
import { DurationWheel } from '@/components/duration-wheel';
import { DecayStyle, DHULO_THEMES, ThemeId } from '@/lib/dhulo';

const PROJECT_URL = 'https://github.com/swaznil/dhulo';
const PRIVACY_URL = 'https://swaznil.github.io/dhulo/privacy-policy.html';
const SUPPORT_URL = 'mailto:swaznilxd@gmail.com';
const brandMark = require('@/assets/images/brand-mark.png');

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
  const openProject = () => Linking.openURL(PROJECT_URL).catch(() => undefined);
  const openPrivacy = () => Linking.openURL(PRIVACY_URL).catch(() => undefined);
  const openSupport = () => Linking.openURL(SUPPORT_URL).catch(() => undefined);
  const version = Constants.expoConfig?.version ?? '1.0.0';

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
          <Section title="Note defaults" theme={theme}>
            <View style={styles.settingCopy}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Starting time</Text>
              <Text style={[styles.settingHint, { color: theme.muted }]}>Used when you create a note. Each note can still have its own timer.</Text>
            </View>
            <DurationWheel onChange={onDefaultDurationChange} theme={theme} value={defaultDuration} />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.settingCopy}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Starting decay</Text>
              <Text style={[styles.settingHint, { color: theme.muted }]}>The first decay style selected in a new note.</Text>
            </View>
            <DecayPreview onSelect={onDefaultStyleChange} selectedStyle={defaultStyle} theme={theme} />
          </Section>

          <Section title="When time runs out" theme={theme}>
            <ToggleRow label="Remove it automatically" onValueChange={onAutoEraseChange} theme={theme} value={autoEraseEnabled} />
            <Text style={[styles.helperText, { color: theme.muted }]}>
              {autoEraseEnabled ? 'Dhulo plays the ending and removes the note. There is no bin or undo.' : 'The note waits at zero until you tap Release for good. It still cannot be reopened.'}
            </Text>
          </Section>

          <Section title="Feedback" theme={theme}>
            <ToggleRow label="Gentle tap feedback" onValueChange={onHapticsChange} theme={theme} value={hapticsEnabled} />
            <ToggleRow label="Sound when a note leaves" onValueChange={onSoundChange} theme={theme} value={soundEnabled} />
            <ToggleRow label="Slow wallpaper movement" onValueChange={onAmbientMotionChange} theme={theme} value={ambientMotionEnabled} />
          </Section>

          <Section title="Appearance and help" theme={theme}>
            <ActionRow icon="palette" label="Colours and wallpaper" onPress={onPersonalizationPress} theme={theme} />
            <ActionRow icon="touch-app" label="Run the tutorial again" onPress={onGuidePress} theme={theme} />
            <ActionRow icon="code" label="GitHub project" onPress={openProject} theme={theme} />
            <ActionRow badge="Coming soon" disabled icon="ios-share" label="Share Dhulo" onPress={() => undefined} theme={theme} />
          </Section>
          <View style={[styles.aboutFooter, { borderTopColor: theme.border }]}>
            <ExpoImage contentFit="contain" source={brandMark} style={styles.aboutLogoImage} />
            <Text style={[styles.aboutName, { color: theme.text }]}>Dhulo</Text>
            <View style={[styles.versionBadge, { backgroundColor: theme.elevated }]}>
              <Text style={[styles.versionText, { color: theme.muted }]}>v{version}</Text>
            </View>
            <Text style={[styles.aboutText, { color: theme.muted }]}>A quiet place for thoughts that need somewhere to land, but do not need to stay.</Text>
            <Text style={[styles.aboutNote, { color: theme.faint }]}>Thoughts meant to fade.</Text>
            <View style={styles.aboutActions}>
              <AboutButton icon="privacy-tip" label="Privacy Policy" onPress={openPrivacy} theme={theme} />
              <AboutButton icon="mail-outline" label="Contact Support" onPress={openSupport} theme={theme} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

function AboutButton({
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
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => [styles.aboutButton, { borderColor: theme.border, opacity: pressed ? 0.62 : 1 }]}>
      <MaterialIcons color={theme.accent} name={icon} size={16} />
      <Text style={[styles.aboutButtonText, { color: theme.text }]}>{label}</Text>
    </Pressable>
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
  badge,
  disabled,
  icon,
  label,
  onPress,
  theme,
}: {
  badge?: string;
  disabled?: boolean;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  theme: typeof DHULO_THEMES.obsidian;
}) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.row, { borderBottomColor: theme.border, opacity: disabled ? 0.7 : 1 }]}>
      <RowIcon icon={icon} theme={theme} />
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      {badge ? (
        <View style={[styles.comingSoon, { backgroundColor: theme.elevated }]}>
          <MaterialIcons name="schedule" size={14} color={theme.muted} />
          <Text style={[styles.comingSoonText, { color: theme.muted }]}>{badge}</Text>
        </View>
      ) : (
        <MaterialIcons name="chevron-right" size={22} color={theme.faint} />
      )}
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
  aboutActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    maxWidth: 380,
    width: '100%',
  },
  aboutButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 10,
  },
  aboutButtonText: {
    fontSize: 12,
    fontWeight: '900',
  },
  aboutEyebrow: {
    alignSelf: 'stretch',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  aboutFooter: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 9,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingTop: 24,
  },
  aboutLogoImage: {
    height: 58,
    marginBottom: 2,
    width: 58,
  },
  aboutName: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  aboutNote: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  aboutText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    maxWidth: 410,
    textAlign: 'center',
  },
  comingSoon: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '900',
  },
  content: {
    gap: 24,
    padding: 20,
    paddingBottom: 54,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  group: {
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  helperText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: -5,
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
    gap: 9,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.75,
    paddingHorizontal: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  versionBadge: {
    borderCurve: 'continuous',
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
