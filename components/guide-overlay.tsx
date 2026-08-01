import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DecayText } from '@/components/dhulo/decay-text';
import { BackgroundArtwork } from '@/components/dhulo/ambient-field';
import { AppBackgroundStyle } from '@/context/dhulo-store';
import { useGlobalTimer } from '@/hooks/use-global-timer';
import { DECAY_OPTIONS, DecayStyle, DHULO_THEMES, ThemeId } from '@/lib/dhulo';
import { BACKGROUND_OPTIONS, THEME_IDS } from '@/utils/constants';

const brandMark = require('@/assets/images/brand-mark.png');
const STEP_COUNT = 4;
const PROJECT_URL = 'https://github.com/swaznil/dhulo';
const PRIVACY_URL = 'https://swaznil.github.io/dhulo/privacy-policy.html';

type Props = {
  backgroundStyle: AppBackgroundStyle;
  onBackgroundStyleChange: (backgroundStyle: AppBackgroundStyle) => void;
  onComplete: () => void;
  onCreateNote: (initialBody: string) => void;
  onThemeChange: (themeId: ThemeId) => void;
  themeId: ThemeId;
};

export function GuideOverlay({ backgroundStyle, onBackgroundStyleChange, onComplete, onCreateNote, onThemeChange, themeId }: Props) {
  const [step, setStep] = useState(0);
  const [practiceText, setPracticeText] = useState('');
  const [styleId, setStyleId] = useState<DecayStyle>('drift');
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewRunning, setPreviewRunning] = useState(false);
  const [released, setReleased] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const now = useGlobalTimer(700);
  const theme = DHULO_THEMES[themeId];
  const compact = height < 740;

  useEffect(
    () => () => {
      if (previewTimer.current) {
        clearInterval(previewTimer.current);
      }
    },
    []
  );

  function stopPreview() {
    if (previewTimer.current) {
      clearInterval(previewTimer.current);
      previewTimer.current = null;
    }
    setPreviewRunning(false);
  }

  function playPreview() {
    stopPreview();
    setPreviewProgress(0);
    setPreviewRunning(true);
    const startedAt = Date.now();
    const duration = 2500;

    previewTimer.current = setInterval(() => {
      const elapsed = Math.min(1, (Date.now() - startedAt) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setPreviewProgress(eased);

      if (elapsed >= 1) {
        stopPreview();
      }
    }, 60);
  }

  function chooseStyle(nextStyle: DecayStyle) {
    stopPreview();
    setPreviewProgress(0);
    setStyleId(nextStyle);
  }

  function goBack() {
    stopPreview();
    setPreviewProgress(0);
    setReleased(false);
    setStep((current) => Math.max(0, current - 1));
  }

  function goNext() {
    stopPreview();
    setPreviewProgress(0);

    if (step === STEP_COUNT - 1) {
      onCreateNote(practiceText.trim());
      return;
    }

    setStep((current) => current + 1);
  }

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={[
        styles.layer,
        {
          backgroundColor: theme.background,
          paddingBottom: Math.max(insets.bottom, 16),
          paddingTop: Math.max(insets.top, 16),
        },
      ]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <BackgroundArtwork backgroundStyle={backgroundStyle} theme={theme} />
      </View>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Image contentFit="contain" source={brandMark} style={styles.brandMark} />
          <View>
            <Text style={[styles.brandName, { color: theme.text }]}>Dhulo</Text>
            <Text style={[styles.tourLabel, { color: theme.faint }]}>QUICK TOUR</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={onComplete} style={({ pressed }) => [styles.skip, { opacity: pressed ? 0.5 : 1 }]}>
          <Text style={[styles.skipText, { color: theme.muted }]}>Skip</Text>
        </Pressable>
      </View>

      <View accessibilityLabel={`Step ${step + 1} of ${STEP_COUNT}`} style={styles.progressRow}>
        {Array.from({ length: STEP_COUNT }, (_, index) => (
          <View
            key={index}
            style={[
              styles.progressStep,
              { backgroundColor: index <= step ? theme.accent : theme.border },
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.stage, compact && styles.stageCompact]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInRight.duration(220)} exiting={FadeOutLeft.duration(150)} key={step} style={styles.lesson}>
          {step === 0 ? (
            <IntroLesson
              backgroundStyle={backgroundStyle}
              onBackgroundStyleChange={onBackgroundStyleChange}
              onThemeChange={onThemeChange}
              theme={theme}
              themeId={themeId}
            />
          ) : step === 1 ? (
            <WriteLesson practiceText={practiceText} setPracticeText={setPracticeText} theme={theme} />
          ) : step === 2 ? (
            <FadeLesson
              now={now}
              onPlay={playPreview}
              onSelectStyle={chooseStyle}
              practiceText={practiceText}
              previewProgress={previewProgress}
              previewRunning={previewRunning}
              styleId={styleId}
              theme={theme}
            />
          ) : (
            <ReleaseLesson onRelease={() => setReleased(true)} released={released} theme={theme} />
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 ? (
          <Pressable accessibilityRole="button" hitSlop={10} onPress={goBack} style={styles.backButton}>
            <MaterialIcons color={theme.muted} name="arrow-back" size={18} />
            <Text style={[styles.backText, { color: theme.muted }]}>Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable
          accessibilityRole="button"
          onPress={goNext}
          style={({ pressed }) => [styles.nextButton, { backgroundColor: theme.text, opacity: pressed ? 0.68 : 1 }]}>
          <Text style={[styles.nextText, { color: theme.background }]}>
            {step === 0 ? 'Show me around' : step === 1 ? 'Choose a fade' : step === 2 ? 'See the final step' : 'Write my note'}
          </Text>
          <MaterialIcons color={theme.background} name="arrow-forward" size={18} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

function IntroLesson({
  backgroundStyle,
  onBackgroundStyleChange,
  onThemeChange,
  theme,
  themeId,
}: {
  backgroundStyle: AppBackgroundStyle;
  onBackgroundStyleChange: (backgroundStyle: AppBackgroundStyle) => void;
  onThemeChange: (themeId: ThemeId) => void;
  theme: typeof DHULO_THEMES.noir;
  themeId: ThemeId;
}) {
  return (
    <>
      <View style={styles.lessonCopy}>
        <Text style={[styles.stepLabel, { color: theme.accent }]}>0 · A SMALL PLACE TO EXHALE</Text>
        <Text style={[styles.title, { color: theme.text }]}>Your mind can put things down here.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Write the thought that keeps circling. Give it some time. Watch it loosen, fade, and leave when you are ready.</Text>
      </View>

      <View style={styles.pickerSection}>
        <Text style={[styles.pickerLabel, { color: theme.text }]}>Pick a colour</Text>
        <ScrollView contentContainerStyle={styles.themePicker} horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false}>
          {THEME_IDS.map((optionId) => {
            const option = DHULO_THEMES[optionId];
            const selected = optionId === themeId;
            return (
              <Pressable
                accessibilityLabel={`Use ${option.name} theme`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={optionId}
                onPress={() => onThemeChange(optionId)}
                style={[styles.themePick, { backgroundColor: option.surface, borderColor: selected ? theme.accent : option.border }]}>
                <View style={[styles.themeDot, { backgroundColor: option.accent }]} />
                <Text style={[styles.themePickText, { color: option.text }]}>{option.name}</Text>
                {selected ? <MaterialIcons color={theme.accent} name="check" size={15} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.pickerSection}>
        <Text style={[styles.pickerLabel, { color: theme.text }]}>Pick a backdrop</Text>
        <ScrollView contentContainerStyle={styles.backgroundPicker} horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false}>
          {BACKGROUND_OPTIONS.map((option) => {
            const selected = option.id === backgroundStyle;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={option.id}
                onPress={() => onBackgroundStyleChange(option.id)}
                style={[styles.backgroundPick, { backgroundColor: theme.surface, borderColor: selected ? theme.accent : theme.border }]}>
                <View style={[styles.backgroundPreview, { backgroundColor: theme.background }]} pointerEvents="none">
                  <BackgroundArtwork backgroundStyle={option.id} theme={theme} />
                </View>
                <Text style={[styles.backgroundPickText, { color: theme.text }]}>{option.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.quietLinks}>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(PROJECT_URL).catch(() => undefined)}>
          <Text style={[styles.quietLink, { color: theme.faint }]}>GitHub</Text>
        </Pressable>
        <Text style={[styles.quietDivider, { color: theme.faint }]}>·</Text>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(PRIVACY_URL).catch(() => undefined)}>
          <Text style={[styles.quietLink, { color: theme.faint }]}>Privacy</Text>
        </Pressable>
      </View>
    </>
  );
}

function WriteLesson({
  practiceText,
  setPracticeText,
  theme,
}: {
  practiceText: string;
  setPracticeText: (text: string) => void;
  theme: typeof DHULO_THEMES.noir;
}) {
  return (
    <>
      <View style={styles.lessonCopy}>
        <Text style={[styles.stepLabel, { color: theme.accent }]}>1 · WRITE IT DOWN</Text>
        <Text style={[styles.title, { color: theme.text }]}>Get it out of your head.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>
          Dhulo is a private place for whatever is bothering you. Write it as it comes. It does not have to sound calm, clever or complete.
        </Text>
      </View>

      <View style={[styles.practiceEditor, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.practiceHeader}>
          <View style={[styles.practiceDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.practiceLabel, { color: theme.text }]}>Try it here</Text>
          <Text style={[styles.notSaved, { color: theme.faint }]}>NOT SAVED YET</Text>
        </View>
        <TextInput
          accessibilityLabel="Try writing what is bothering you"
          maxLength={220}
          multiline
          onChangeText={setPracticeText}
          placeholder="What’s bothering you?"
          placeholderTextColor={theme.faint}
          style={[styles.practiceInput, { color: theme.text }]}
          textAlignVertical="top"
          value={practiceText}
        />
        <View style={styles.practiceFooter}>
          <Text style={[styles.practiceHint, { color: theme.muted }]}>Only you will see this.</Text>
          <Text style={[styles.characterCount, { color: theme.faint }]}>{practiceText.length}/220</Text>
        </View>
      </View>
    </>
  );
}

function FadeLesson({
  now,
  onPlay,
  onSelectStyle,
  practiceText,
  previewProgress,
  previewRunning,
  styleId,
  theme,
}: {
  now: number;
  onPlay: () => void;
  onSelectStyle: (style: DecayStyle) => void;
  practiceText: string;
  previewProgress: number;
  previewRunning: boolean;
  styleId: DecayStyle;
  theme: typeof DHULO_THEMES.noir;
}) {
  const previewText = practiceText.trim() || 'I keep replaying this in my head.';

  return (
    <>
      <View style={styles.lessonCopy}>
        <Text style={[styles.stepLabel, { color: theme.accent }]}>2 · WATCH IT CHANGE</Text>
        <Text style={[styles.title, { color: theme.text }]}>Choose how the words fade.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Tap a style, then run the preview. A real note changes slowly while its time runs down.</Text>
      </View>

      <View style={styles.styleRow}>
        {DECAY_OPTIONS.map((option) => {
          const selected = option.id === styleId;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.id}
              onPress={() => onSelectStyle(option.id)}
              style={({ pressed }) => [
                styles.styleButton,
                {
                  backgroundColor: selected ? theme.text : theme.surface,
                  borderColor: selected ? theme.text : theme.border,
                  opacity: pressed ? 0.68 : 1,
                },
              ]}>
              <Text style={[styles.styleButtonText, { color: selected ? theme.background : theme.text }]}>{option.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.previewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.previewTopRow}>
          <Text style={[styles.previewLabel, { color: theme.faint }]}>LIVE PREVIEW</Text>
          <Text style={[styles.previewPercent, { color: theme.muted }]}>{Math.round(previewProgress * 100)}%</Text>
        </View>
        <View style={styles.previewTextWrap}>
          <DecayText
            color={theme.text}
            lineHeight={28}
            mutedColor={theme.faint}
            now={now}
            progress={previewProgress}
            seed="guide-preview"
            size={18}
            styleId={styleId}
            text={previewText}
            weight="700"
          />
        </View>
        <View style={[styles.previewRail, { backgroundColor: theme.elevated }]}>
          <View style={[styles.previewFill, { backgroundColor: theme.accent, width: `${previewProgress * 100}%` }]} />
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={previewRunning}
          onPress={onPlay}
          style={({ pressed }) => [styles.previewButton, { borderColor: theme.border, opacity: previewRunning ? 0.5 : pressed ? 0.68 : 1 }]}>
          <MaterialIcons color={theme.text} name={previewProgress >= 1 ? 'replay' : 'play-arrow'} size={19} />
          <Text style={[styles.previewButtonText, { color: theme.text }]}>{previewRunning ? 'Fading…' : previewProgress >= 1 ? 'Watch again' : 'Watch it fade'}</Text>
        </Pressable>
      </View>
    </>
  );
}

function ReleaseLesson({
  onRelease,
  released,
  theme,
}: {
  onRelease: () => void;
  released: boolean;
  theme: typeof DHULO_THEMES.noir;
}) {
  return (
    <>
      <View style={styles.lessonCopy}>
        <Text style={[styles.stepLabel, { color: theme.accent }]}>3 · LET IT GO</Text>
        <Text style={[styles.title, { color: theme.text }]}>This part cannot be undone.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Use Decay now when you want to watch the ending. At zero, the writing cannot be opened again. Release for good removes the note from this device.</Text>
      </View>

      <View style={[styles.releaseDemo, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {released ? (
          <Animated.View entering={FadeIn.duration(220)} style={styles.releasedState}>
            <View style={[styles.releasedIcon, { backgroundColor: theme.elevated }]}>
              <MaterialIcons color={theme.accent} name="done" size={25} />
            </View>
            <Text style={[styles.releasedTitle, { color: theme.text }]}>Gone from this device.</Text>
            <Text style={[styles.releasedText, { color: theme.muted }]}>There is no trash folder, restore button or hidden copy.</Text>
          </Animated.View>
        ) : (
          <>
            <View style={styles.expiredTopRow}>
              <View style={[styles.expiredIcon, { backgroundColor: theme.elevated }]}>
                <MaterialIcons color={theme.secondary} name="hourglass-disabled" size={21} />
              </View>
              <View style={styles.expiredCopy}>
                <Text style={[styles.expiredTitle, { color: theme.text }]}>Time is up</Text>
                <Text style={[styles.expiredText, { color: theme.muted }]}>The writing is no longer available.</Text>
              </View>
            </View>
            <View style={[styles.blankLine, { backgroundColor: theme.border, width: '82%' }]} />
            <View style={[styles.blankLine, { backgroundColor: theme.border, width: '58%' }]} />
            <View style={[styles.blankLine, { backgroundColor: theme.border, width: '34%' }]} />
            <Pressable
              accessibilityRole="button"
              onPress={onRelease}
              style={({ pressed }) => [styles.releaseButton, { backgroundColor: theme.text, opacity: pressed ? 0.68 : 1 }]}>
              <MaterialIcons color={theme.background} name="delete-forever" size={18} />
              <Text style={[styles.releaseButtonText, { color: theme.background }]}>Try Release for good</Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={[styles.rememberRow, { borderColor: theme.border }]}>
        <MaterialIcons color={theme.accent} name="lightbulb-outline" size={18} />
        <Text style={[styles.rememberText, { color: theme.muted }]}>Before zero, you can put a note on hold or add more time.</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundPick: {
    borderCurve: 'continuous',
    borderRadius: 15,
    borderWidth: 1,
    gap: 7,
    padding: 7,
    width: 132,
  },
  backgroundPicker: {
    gap: 9,
    paddingRight: 8,
  },
  backgroundPickText: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 3,
    paddingBottom: 2,
  },
  backgroundPreview: {
    borderCurve: 'continuous',
    borderRadius: 10,
    height: 66,
    overflow: 'hidden',
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    minHeight: 50,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '800',
  },
  blankLine: {
    borderRadius: 99,
    height: 5,
    opacity: 0.55,
  },
  body: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 23,
    maxWidth: 600,
  },
  brandMark: {
    height: 35,
    width: 35,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  characterCount: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  expiredCopy: {
    flex: 1,
    gap: 3,
  },
  expiredIcon: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  expiredText: {
    fontSize: 13,
    fontWeight: '600',
  },
  expiredTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  expiredTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  lesson: {
    gap: 20,
    maxWidth: 660,
    width: '100%',
  },
  lessonCopy: {
    gap: 9,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '900',
  },
  pickerSection: {
    gap: 9,
  },
  nextButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 15,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 18,
  },
  nextText: {
    fontSize: 14,
    fontWeight: '900',
  },
  notSaved: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginLeft: 'auto',
  },
  practiceDot: {
    borderRadius: 99,
    height: 8,
    width: 8,
  },
  practiceEditor: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 250,
    padding: 17,
  },
  practiceFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  practiceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  practiceHint: {
    fontSize: 12,
    fontWeight: '600',
  },
  practiceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
    minHeight: 150,
    paddingHorizontal: 0,
    paddingTop: 22,
  },
  practiceLabel: {
    fontSize: 13,
    fontWeight: '900',
  },
  quietDivider: {
    fontSize: 11,
  },
  quietLink: {
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  quietLinks: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingTop: 2,
  },
  previewButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  previewButtonText: {
    fontSize: 13,
    fontWeight: '900',
  },
  previewCard: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    gap: 15,
    minHeight: 220,
    padding: 18,
  },
  previewFill: {
    borderRadius: 99,
    height: '100%',
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  previewPercent: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  previewRail: {
    borderRadius: 99,
    height: 6,
    overflow: 'hidden',
  },
  previewTextWrap: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 72,
  },
  previewTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  progressStep: {
    borderRadius: 99,
    flex: 1,
    height: 3,
  },
  releaseButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderCurve: 'continuous',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  releaseButtonText: {
    fontSize: 13,
    fontWeight: '900',
  },
  releaseDemo: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    gap: 13,
    minHeight: 250,
    padding: 18,
  },
  releasedIcon: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  releasedState: {
    alignItems: 'center',
    flex: 1,
    gap: 9,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  releasedText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    maxWidth: 320,
    textAlign: 'center',
  },
  releasedTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  rememberRow: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    padding: 12,
  },
  rememberText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  skip: {
    padding: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  stage: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  stageCompact: {
    justifyContent: 'flex-start',
    paddingVertical: 14,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  styleButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  styleButtonText: {
    fontSize: 12,
    fontWeight: '900',
  },
  styleRow: {
    flexDirection: 'row',
    gap: 7,
  },
  themeDot: {
    borderRadius: 99,
    height: 14,
    width: 14,
  },
  themePick: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 40,
    paddingHorizontal: 11,
  },
  themePicker: {
    gap: 8,
    paddingRight: 8,
  },
  themePickText: {
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 37,
    maxWidth: 620,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  tourLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    paddingTop: 1,
  },
});
