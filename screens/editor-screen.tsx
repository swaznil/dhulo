import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { DecayPreview } from '@/components/decay-preview';
import { DurationWheel } from '@/components/duration-wheel';
import { FloatingToolbar } from '@/components/floating-toolbar';
import { useKeyboardToolbar } from '@/hooks/use-keyboard-toolbar';
import { DECAY_OPTIONS, DecayStyle, DHULO_THEMES, ThemeId } from '@/lib/dhulo';
import { NOTE_COLOR_IDS } from '@/utils/constants';
import { formatDuration, formatTimestamp, isWordHistoryBoundary } from '@/utils/note';

type Props = {
  attachImage: () => void;
  body: string;
  duration: number;
  imageUri?: string;
  noteThemeId: ThemeId;
  onBack: () => void;
  onDurationChange: (duration: number) => void;
  onImageRemove: () => void;
  onSave: () => void;
  onStyleChange: (style: DecayStyle) => void;
  onThemeChange: (themeId: ThemeId) => void;
  setBody: (body: string) => void;
  setTitle: (title: string) => void;
  styleId: DecayStyle;
  title: string;
};

export function EditorScreen({
  attachImage,
  body,
  duration,
  imageUri,
  noteThemeId,
  onBack,
  onDurationChange,
  onImageRemove,
  onSave,
  onStyleChange,
  onThemeChange,
  setBody,
  setTitle,
  styleId,
  title,
}: Props) {
  const theme = DHULO_THEMES[noteThemeId];
  const { keyboardHeight, visible: keyboardVisible } = useKeyboardToolbar();
  const [imageFailed, setImageFailed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bodyHistory, setBodyHistory] = useState([body]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [bodySize, setBodySize] = useState(18);
  const currentHistoryBody = bodyHistory[historyIndex] ?? '';
  const canUndo = historyIndex > 0 || body !== currentHistoryBody;
  const canRedo = historyIndex < bodyHistory.length - 1;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  const updateBody = useCallback(
    (nextBody: string) => {
      const shouldSaveWord = isWordHistoryBoundary(body, nextBody);
      setBody(nextBody);

      if (shouldSaveWord) {
        setBodyHistory((currentHistory) => {
          const nextHistory = [...currentHistory.slice(0, historyIndex + 1), nextBody].slice(-40);
          setHistoryIndex(nextHistory.length - 1);
          return nextHistory;
        });
      }
    },
    [body, historyIndex, setBody]
  );

  const undoBody = useCallback(() => {
    if (!canUndo) {
      return;
    }

    if (body !== currentHistoryBody) {
      setBody(currentHistoryBody);
      return;
    }

    const nextIndex = Math.max(0, historyIndex - 1);
    setHistoryIndex(nextIndex);
    setBody(bodyHistory[nextIndex] ?? '');
  }, [body, bodyHistory, canUndo, currentHistoryBody, historyIndex, setBody]);

  const redoBody = useCallback(() => {
    if (!canRedo) {
      return;
    }

    const nextIndex = Math.min(bodyHistory.length - 1, historyIndex + 1);
    setHistoryIndex(nextIndex);
    setBody(bodyHistory[nextIndex] ?? '');
  }, [bodyHistory, canRedo, historyIndex, setBody]);

  const timestamp = useMemo(() => formatTimestamp(Date.now()), []);

  return (
    <AmbientBackground theme={theme}>
      <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          <View style={styles.header}>
            <Pressable accessibilityLabel="Close editor" accessibilityRole="button" onPress={onBack} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
              <MaterialIcons name="close" size={22} color={theme.text} />
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable accessibilityLabel="Note options" accessibilityRole="button" onPress={() => setSettingsOpen((open) => !open)} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
                <MaterialIcons name="tune" size={21} color={theme.text} />
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onSave} style={[styles.doneButton, { backgroundColor: theme.text }]}>
                <Text style={[styles.doneText, { color: theme.background }]}>Done</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: keyboardVisible ? 126 : 104 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TextInput
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={theme.faint}
              style={[styles.titleInput, { color: theme.text }]}
              value={title}
            />
            <Text style={[styles.timestamp, { color: theme.faint }]}>{timestamp}</Text>

            {imageUri && !imageFailed ? (
              <View style={styles.imageWrap}>
                <Image onError={() => setImageFailed(true)} source={{ uri: imageUri }} style={styles.attachedImage} />
                <Pressable accessibilityLabel="Remove image" accessibilityRole="button" onPress={onImageRemove} style={[styles.removeImage, { backgroundColor: theme.surface }]}>
                  <MaterialIcons name="close" size={18} color={theme.text} />
                </Pressable>
              </View>
            ) : imageFailed ? (
              <Text style={[styles.imageError, { color: theme.faint }]}>Image could not be loaded.</Text>
            ) : null}

            <TextInput
              multiline
              onChangeText={updateBody}
              placeholder="Start writing..."
              placeholderTextColor={theme.faint}
              style={[
                styles.bodyInput,
                {
                  color: theme.text,
                  fontSize: bodySize,
                  fontWeight: '400',
                  lineHeight: bodySize * 1.58,
                },
              ]}
              textAlignVertical="top"
              value={body}
            />
          </ScrollView>

          <FloatingToolbar
            bodySize={bodySize}
            bottom={keyboardVisible ? keyboardHeight + 10 : 22}
            canRedo={canRedo}
            canUndo={canUndo}
            onAttachImage={attachImage}
            onBodySizeChange={setBodySize}
            onRedo={redoBody}
            onUndo={undoBody}
            theme={theme}
          />

          {settingsOpen ? (
            <NoteOptionsSheet
              duration={duration}
              noteThemeId={noteThemeId}
              onClose={() => setSettingsOpen(false)}
              onDurationChange={onDurationChange}
              onStyleChange={onStyleChange}
              onThemeChange={onThemeChange}
              styleId={styleId}
              theme={theme}
            />
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

function NoteOptionsSheet({
  duration,
  noteThemeId,
  onClose,
  onDurationChange,
  onStyleChange,
  onThemeChange,
  styleId,
  theme,
}: {
  duration: number;
  noteThemeId: ThemeId;
  onClose: () => void;
  onDurationChange: (duration: number) => void;
  onStyleChange: (style: DecayStyle) => void;
  onThemeChange: (themeId: ThemeId) => void;
  styleId: DecayStyle;
  theme: typeof DHULO_THEMES.obsidian;
}) {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      duration: 180,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const backdropStyle = {
    opacity: entrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
  };
  const sheetStyle = {
    opacity: entrance,
    transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [36, 0] }) }],
  };

  return (
    <View style={styles.sheetLayer}>
      <Animated.View pointerEvents="none" style={[styles.sheetBackdrop, backdropStyle]} />
      <Pressable accessibilityLabel="Close note options" onPress={onClose} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }, sheetStyle]}>
        <ScrollView contentContainerStyle={styles.sheetContent} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Note behavior</Text>
              <Text style={[styles.sheetSubtitle, { color: theme.muted }]}>Every note fades after this timer.</Text>
            </View>
            <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose} style={[styles.iconButton, { backgroundColor: theme.elevated }]}>
              <MaterialIcons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.faint }]}>Decay style</Text>
            <Text style={[styles.sectionValue, { color: theme.muted }]}>{DECAY_OPTIONS.find((option) => option.id === styleId)?.name}</Text>
          </View>
          <DecayPreview onSelect={onStyleChange} selectedStyle={styleId} theme={theme} />

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.faint }]}>Lifespan</Text>
            <Text style={[styles.sectionValue, { color: theme.muted }]}>{formatDuration(duration)}</Text>
          </View>
          <DurationWheel onChange={onDurationChange} theme={theme} value={duration} />

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.faint }]}>Paper tone</Text>
            <Text style={[styles.sectionValue, { color: theme.muted }]}>{DHULO_THEMES[noteThemeId].name}</Text>
          </View>
          <ScrollView contentContainerStyle={styles.themeStrip} horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false}>
            {NOTE_COLOR_IDS.map((themeId) => {
              const noteTheme = DHULO_THEMES[themeId];
              const selected = themeId === noteThemeId;

              return (
                <Pressable
                  accessibilityLabel={`Use ${noteTheme.name} note theme`}
                  accessibilityRole="button"
                  key={themeId}
                  onPress={() => onThemeChange(themeId)}
                  style={[styles.themeChoice, { backgroundColor: noteTheme.surface, borderColor: selected ? theme.accent : noteTheme.border }]}>
                  <View style={[styles.themeChoicePreview, { backgroundColor: noteTheme.background }]}>
                    <View style={[styles.themeChoiceAccent, { backgroundColor: noteTheme.accent }]} />
                    <View style={[styles.themeChoiceLine, { backgroundColor: noteTheme.muted }]} />
                  </View>
                  <Text numberOfLines={1} style={[styles.themeChoiceName, { color: noteTheme.text }]}>{noteTheme.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  attachedImage: {
    height: '100%',
    width: '100%',
  },
  bodyInput: {
    letterSpacing: 0,
    minHeight: 460,
    paddingBottom: 30,
    paddingTop: 12,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  doneButton: {
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '900',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  imageError: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 16,
  },
  imageWrap: {
    borderRadius: 8,
    height: 190,
    marginBottom: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  keyboard: {
    flex: 1,
  },
  removeImage: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 34,
  },
  safeArea: {
    flex: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  sectionValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  sheet: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000066',
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetContent: {
    gap: 12,
    padding: 18,
    paddingBottom: 30,
  },
  sheetLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  themeStrip: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
    paddingRight: 16,
  },
  themeChoice: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    width: 74,
  },
  themeChoiceAccent: {
    borderRadius: 999,
    height: 11,
    width: 11,
  },
  themeChoiceLine: {
    borderRadius: 999,
    height: 4,
    marginTop: 8,
    opacity: 0.55,
    width: '68%',
  },
  themeChoiceName: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 6,
    textAlign: 'center',
  },
  themeChoicePreview: {
    borderRadius: 6,
    height: 44,
    justifyContent: 'center',
    padding: 8,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  titleInput: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 42,
    minHeight: 54,
  },
});
