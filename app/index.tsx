import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler } from 'react-native';

import { FinalDeleteAnimation } from '@/components/final-delete-animation';
import { useNotes, useProfile, useSettings } from '@/context/dhulo-store';
import { useGlobalTimer } from '@/hooks/use-global-timer';
import { DecayStyle, DhuloNote, getNoteProgress, ThemeId } from '@/lib/dhulo';
import { EditorScreen } from '@/screens/editor-screen';
import { HomeScreen } from '@/screens/home-screen';
import { ProfileScreen } from '@/screens/profile-screen';
import { ReaderScreen } from '@/screens/reader-screen';
import { SettingsScreen } from '@/screens/settings-screen';

type ScreenMode = 'home' | 'editor' | 'reader' | 'profile' | 'settings';

export default function DhuloScreen() {
  const { addNote, continueNote, notes, preserveNote, removeNote } = useNotes();
  const {
    appBackgroundStyle,
    appThemeId,
    autoEraseEnabled,
    defaultDuration,
    defaultStyle,
    hapticsEnabled,
    soundEnabled,
    setAppBackgroundStyle,
    setAppThemeId,
    setAutoEraseEnabled,
    setDefaultDuration,
    setDefaultStyle,
    setHapticsEnabled,
    setSoundEnabled,
  } = useSettings();
  const { profileAvatarUri, profileBio, profileInitial, profileName, setProfileAvatarUri, setProfileBio, setProfileName } = useProfile();
  const autoEraseNow = useGlobalTimer(3000);
  const [mode, setMode] = useState<ScreenMode>('home');
  const [profileReturnMode, setProfileReturnMode] = useState<ScreenMode>('home');
  const [readerNoteId, setReaderNoteId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftImageUri, setDraftImageUri] = useState<string | undefined>();
  const [draftDuration, setDraftDuration] = useState(defaultDuration);
  const [draftStyle, setDraftStyle] = useState<DecayStyle>(defaultStyle);
  const [draftThemeId, setDraftThemeId] = useState<ThemeId>(appThemeId);
  const [finaleNote, setFinaleNote] = useState<DhuloNote | null>(null);
  const afterFinalDeleteRef = useRef<(() => void) | null>(null);
  const releaseCue = useAudioPlayer(require('@/assets/sounds/soft-release.wav'), { keepAudioSessionActive: false });

  const readerNote = useMemo(() => notes.find((note) => note.id === readerNoteId) ?? null, [notes, readerNoteId]);

  const completeDelete = useCallback(() => {
    if (!finaleNote) {
      return;
    }

    const afterDelete = afterFinalDeleteRef.current;
    afterFinalDeleteRef.current = null;
    removeNote(finaleNote.id);
    setFinaleNote(null);
    afterDelete?.();
  }, [finaleNote, removeNote]);

  const requestDelete = useCallback(
    (note: DhuloNote, afterDelete?: () => void) => {
      if (finaleNote) {
        return;
      }

      if (hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      }
      if (soundEnabled) {
        releaseCue.volume = 0.34;
        releaseCue.seekTo(0).then(() => releaseCue.play()).catch(() => undefined);
      }
      afterFinalDeleteRef.current = afterDelete ?? null;
      setFinaleNote(note);
    },
    [finaleNote, hapticsEnabled, releaseCue, soundEnabled]
  );

  useEffect(() => {
    if (!soundEnabled) {
      return;
    }

    setAudioModeAsync({
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    }).catch(() => undefined);
  }, [soundEnabled]);

  useEffect(() => {
    if (!autoEraseEnabled || finaleNote) {
      return;
    }

    const expiredNote = notes.find((note) => getNoteProgress(note, autoEraseNow) >= 1);

    if (expiredNote) {
      requestDelete(expiredNote);
    }
  }, [autoEraseEnabled, autoEraseNow, finaleNote, notes, requestDelete]);

  const startNewNote = useCallback(() => {
    setDraftTitle('');
    setDraftBody('');
    setDraftImageUri(undefined);
    setDraftDuration(defaultDuration);
    setDraftStyle(defaultStyle);
    setDraftThemeId(appThemeId);
    setMode('editor');
  }, [appThemeId, defaultDuration, defaultStyle]);

  const attachImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Photos permission needed', 'Allow photo access to attach images to Dhulo notes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (!result.canceled) {
      setDraftImageUri(result.assets[0]?.uri);
    }
  }, []);

  const attachProfileAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Photos permission needed', 'Allow photo access to choose a profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (!result.canceled) {
      setProfileAvatarUri(result.assets[0]?.uri);
    }
  }, [setProfileAvatarUri]);

  const saveDraft = useCallback(
    (preserve = false) => {
      if (!draftTitle.trim() && !draftBody.trim() && !draftImageUri) {
        setMode('home');
        return;
      }

      addNote({
        body: draftBody,
        decayStyle: draftStyle,
        durationMinutes: draftDuration,
        imageUri: draftImageUri,
        isPreserved: preserve,
        preservedProgress: preserve ? 0 : undefined,
        themeId: draftThemeId,
        title: draftTitle || draftBody.split('\n')[0] || 'Untitled note',
      });
      setMode('home');
    },
    [addNote, draftBody, draftDuration, draftImageUri, draftStyle, draftThemeId, draftTitle]
  );

  const openReader = useCallback((note: DhuloNote) => {
    setReaderNoteId(note.id);
    setMode('reader');
  }, []);

  const closeReader = useCallback(() => {
    setReaderNoteId(null);
    setMode('home');
  }, []);

  const openProfile = useCallback((returnMode: ScreenMode = 'home') => {
    setProfileReturnMode(returnMode);
    setMode('profile');
  }, []);

  const closeProfile = useCallback(() => {
    setMode(profileReturnMode);
  }, [profileReturnMode]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (mode === 'reader') {
        closeReader();
        return true;
      }

      if (mode === 'editor') {
        saveDraft(true);
        return true;
      }

      if (mode === 'profile') {
        closeProfile();
        return true;
      }

      if (mode === 'settings') {
        setMode('home');
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [closeProfile, closeReader, mode, saveDraft]);

  if (mode === 'editor') {
    return (
      <EditorScreen
        attachImage={attachImage}
        body={draftBody}
        duration={draftDuration}
        imageUri={draftImageUri}
        noteThemeId={draftThemeId}
        onBack={() => saveDraft(true)}
        onDurationChange={setDraftDuration}
        onImageRemove={() => setDraftImageUri(undefined)}
        onSave={() => saveDraft(false)}
        onStyleChange={setDraftStyle}
        onThemeChange={setDraftThemeId}
        setBody={setDraftBody}
        setTitle={setDraftTitle}
        styleId={draftStyle}
        title={draftTitle}
      />
    );
  }

  if (mode === 'reader' && readerNote) {
    return (
      <>
        <ReaderScreen
          note={readerNote}
          onBack={closeReader}
          onContinue={() => continueNote(readerNote.id)}
          onDelete={() => requestDelete(readerNote, closeReader)}
          onPreserve={() => preserveNote(readerNote.id)}
          onQuickBurn={() => requestDelete(readerNote, closeReader)}
        />
        {finaleNote ? <FinalDeleteAnimation note={finaleNote} onFinish={completeDelete} /> : null}
      </>
    );
  }

  if (mode === 'settings') {
    return (
      <SettingsScreen
        autoEraseEnabled={autoEraseEnabled}
        defaultDuration={defaultDuration}
        defaultStyle={defaultStyle}
        hapticsEnabled={hapticsEnabled}
        notes={notes}
        onAutoEraseChange={setAutoEraseEnabled}
        onBack={() => setMode('home')}
        onDefaultDurationChange={setDefaultDuration}
        onDefaultStyleChange={setDefaultStyle}
        onHapticsChange={setHapticsEnabled}
        onPersonalizationPress={() => openProfile('settings')}
        onSoundChange={setSoundEnabled}
        soundEnabled={soundEnabled}
        themeId={appThemeId}
      />
    );
  }

  if (mode === 'profile') {
    return (
      <ProfileScreen
        notes={notes}
        onAvatarChange={attachProfileAvatar}
        onBackgroundStyleChange={setAppBackgroundStyle}
        onBack={closeProfile}
        onProfileBioChange={setProfileBio}
        onProfileNameChange={setProfileName}
        onThemeChange={setAppThemeId}
        profileBio={profileBio}
        profileAvatarUri={profileAvatarUri}
        profileInitial={profileInitial}
        profileName={profileName}
        selectedBackgroundStyle={appBackgroundStyle}
        selectedThemeId={appThemeId}
        themeId={appThemeId}
      />
    );
  }

  return (
    <>
      <HomeScreen
        appBackgroundStyle={appBackgroundStyle}
        notes={notes}
        onCreateNote={startNewNote}
        onDestroyNote={requestDelete}
        onOpenNote={openReader}
        onOpenProfile={() => openProfile('home')}
        onOpenSettings={() => setMode('settings')}
        profileAvatarUri={profileAvatarUri}
        profileInitial={profileInitial}
        resolvedThemeId={appThemeId}
      />
      {finaleNote ? <FinalDeleteAnimation note={finaleNote} onFinish={completeDelete} /> : null}
    </>
  );
}
