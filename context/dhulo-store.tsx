import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DecayStyle,
  DhuloNote,
  ThemeId,
  makeNote,
  normalizeDecayStyle,
  normalizeThemeId,
} from '@/lib/dhulo';

type CreateNoteInput = {
  title: string;
  body: string;
  imageUri?: string;
  durationMinutes: number;
  decayStyle: DecayStyle;
  themeId: ThemeId;
  isDraft?: boolean;
  isPreserved?: boolean;
  preservedProgress?: number;
};

export type AppBackgroundStyle = 'void' | 'mist' | 'paper' | 'garden' | 'signal' | 'hearts' | 'orbit' | 'blocks';

// --- Notes context (focused on notes + mutations)
type NotesValue = {
  notes: DhuloNote[];
  addNote: (input: CreateNoteInput) => void;
  continueNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  extendNote: (id: string, minutes: number) => void;
  preserveNote: (id: string) => void;
  quickBurnNote: (id: string) => void;
  removeNote: (id: string) => void;
  updateNote: (id: string, input: CreateNoteInput) => void;
};

// --- Settings context (theme, background, defaults)
type SettingsValue = {
  appThemeId: ThemeId;
  appBackgroundStyle: AppBackgroundStyle;
  ambientMotionEnabled: boolean;
  defaultDuration: number;
  defaultStyle: DecayStyle;
  autoEraseEnabled: boolean;
  guideCompleted: boolean;
  hapticsEnabled: boolean;
  hydrated: boolean;
  soundEnabled: boolean;
  setAppThemeId: (themeId: ThemeId) => void;
  setAppBackgroundStyle: (backgroundStyle: AppBackgroundStyle) => void;
  setAmbientMotionEnabled: (enabled: boolean) => void;
  setDefaultDuration: (duration: number) => void;
  setDefaultStyle: (style: DecayStyle) => void;
  setAutoEraseEnabled: (enabled: boolean) => void;
  setGuideCompleted: (completed: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
};

// --- Profile context (user profile fields)
type ProfileValue = {
  profileName: string;
  profileBio: string;
  profileInitial: string;
  profileAvatarUri?: string;
  setProfileName: (name: string) => void;
  setProfileBio: (bio: string) => void;
  setProfileInitial: (initial: string) => void;
  setProfileAvatarUri: (uri?: string) => void;
};

const NotesContext = createContext<NotesValue | null>(null);
const SettingsContext = createContext<SettingsValue | null>(null);
const ProfileContext = createContext<ProfileValue | null>(null);

const STORAGE_KEY = 'dhulo.store.v2';
const LEGACY_STORAGE_KEY = 'dhulo.store.v1';
const BACKGROUND_STYLES: AppBackgroundStyle[] = ['void', 'mist', 'paper', 'garden', 'signal', 'hearts', 'orbit', 'blocks'];

function normalizeBackgroundStyle(backgroundStyle?: string): AppBackgroundStyle {
  return BACKGROUND_STYLES.includes(backgroundStyle as AppBackgroundStyle) ? (backgroundStyle as AppBackgroundStyle) : 'signal';
}

function normalizeDuration(duration?: number) {
  return typeof duration === 'number' && Number.isFinite(duration) ? Math.max(1, Math.round(duration)) : 180;
}

function getSystemThemeId(): ThemeId {
  return Appearance.getColorScheme() === 'light' ? 'paper' : 'noir';
}

export function DhuloStoreProvider({ children }: PropsWithChildren) {
  // Notes
  const [notes, setNotes] = useState<DhuloNote[]>([]);

  // Settings
  const [appThemeId, setAppThemeId] = useState<ThemeId>(() => getSystemThemeId());
  const [appBackgroundStyle, setAppBackgroundStyle] = useState<AppBackgroundStyle>(() => (Appearance.getColorScheme() === 'light' ? 'blocks' : 'signal'));
  const [ambientMotionEnabled, setAmbientMotionEnabled] = useState(true);
  const [defaultDuration, setDefaultDuration] = useState(180);
  const [defaultStyle, setDefaultStyle] = useState<DecayStyle>('drift');
  const [autoEraseEnabled, setAutoEraseEnabled] = useState(false);
  const [guideCompleted, setGuideCompleted] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Profile
  const [profileName, setProfileName] = useState('Dhulo Space');
  const [profileBio, setProfileBio] = useState('Click to edit');
  const [profileInitial, setProfileInitial] = useState('D');
  const [profileAvatarUri, setProfileAvatarUri] = useState<string | undefined>();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function restoreStore() {
      try {
        const stored = (await AsyncStorage.getItem(STORAGE_KEY)) ?? (await AsyncStorage.getItem(LEGACY_STORAGE_KEY));

        if (!stored || !mounted) {
          return;
        }

        const parsed = JSON.parse(stored) as Partial<{
          appThemeId: ThemeId;
          appBackgroundStyle: AppBackgroundStyle;
          ambientMotionEnabled: boolean;
          appearanceMode: string;
          profileName: string;
          profileBio: string;
          profileInitial: string;
          profileAvatarUri: string;
          defaultDuration: number;
          defaultStyle: DecayStyle;
          autoEraseEnabled: boolean;
          guideCompleted: boolean;
          hapticsEnabled: boolean;
          soundEnabled: boolean;
          finalDeleteAnimationEnabled: boolean;
          notes: DhuloNote[];
        }>;

        if (Array.isArray(parsed.notes)) {
          setNotes(
            parsed.notes.filter((note) => note && typeof note.id === 'string').map((note) => ({
              ...note,
              body: typeof note.body === 'string' ? note.body : '',
              createdAt: typeof note.createdAt === 'number' ? note.createdAt : Date.now(),
              decayStyle: normalizeDecayStyle(note.decayStyle),
              durationMinutes: normalizeDuration(note.durationMinutes),
              isPreserved: Boolean(note.isPreserved),
              isDraft: Boolean(note.isDraft),
              preservedProgress: typeof note.preservedProgress === 'number' ? note.preservedProgress : 0,
              title: typeof note.title === 'string' ? note.title : 'Untitled release',
              themeId: normalizeThemeId(note.themeId),
            }))
          );
        }

        if (parsed.appThemeId) {
          setAppThemeId(normalizeThemeId(parsed.appThemeId));
        }

        if (parsed.appBackgroundStyle) {
          setAppBackgroundStyle(normalizeBackgroundStyle(parsed.appBackgroundStyle));
        }

        if (typeof parsed.defaultDuration === 'number') {
          setDefaultDuration(normalizeDuration(parsed.defaultDuration));
        }

        if (typeof parsed.profileName === 'string') {
          setProfileName(parsed.profileName);
        }

        if (typeof parsed.profileBio === 'string') {
          setProfileBio(parsed.profileBio);
        }

        if (typeof parsed.profileInitial === 'string') {
          setProfileInitial(parsed.profileInitial.slice(0, 2).toUpperCase() || 'D');
        }

        if (typeof parsed.profileAvatarUri === 'string') {
          setProfileAvatarUri(parsed.profileAvatarUri);
        }

        if (parsed.defaultStyle) {
          setDefaultStyle(normalizeDecayStyle(parsed.defaultStyle));
        }

        if (typeof parsed.autoEraseEnabled === 'boolean') {
          setAutoEraseEnabled(parsed.autoEraseEnabled);
        } else if (typeof parsed.finalDeleteAnimationEnabled === 'boolean') {
          setAutoEraseEnabled(false);
        }

        if (typeof parsed.ambientMotionEnabled === 'boolean') {
          setAmbientMotionEnabled(parsed.ambientMotionEnabled);
        }

        if (typeof parsed.guideCompleted === 'boolean') {
          setGuideCompleted(parsed.guideCompleted);
        }

        if (typeof parsed.hapticsEnabled === 'boolean') {
          setHapticsEnabled(parsed.hapticsEnabled);
        }

        if (typeof parsed.soundEnabled === 'boolean') {
          setSoundEnabled(parsed.soundEnabled);
        }
      } catch {
        // Keep the app usable even if old stored data cannot be parsed.
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    }

    restoreStore();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        appThemeId,
        appBackgroundStyle,
        ambientMotionEnabled,
        profileName,
        profileBio,
        profileInitial,
        profileAvatarUri,
        defaultDuration,
        defaultStyle,
        autoEraseEnabled,
        guideCompleted,
        hapticsEnabled,
        soundEnabled,
        notes,
      })
    ).catch(() => {
      // Local persistence can fail in private storage or low disk states. The in-memory app remains usable.
    });
  }, [ambientMotionEnabled, appBackgroundStyle, appThemeId, autoEraseEnabled, defaultDuration, defaultStyle, guideCompleted, hapticsEnabled, hydrated, notes, profileAvatarUri, profileBio, profileInitial, profileName, soundEnabled]);

  // Notes actions
  const addNote = useCallback((input: CreateNoteInput) => {
    setNotes((currentNotes) => [makeNote(input), ...currentNotes]);
  }, []);

  const continueNote = useCallback((id: string) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) => {
        if (note.id !== id) {
          return note;
        }

        const progress = Math.max(0, Math.min(note.preservedProgress ?? 0, 1));
        return {
          ...note,
          createdAt: Date.now() - progress * note.durationMinutes * 60 * 1000,
          isPreserved: false,
          preservedProgress: undefined,
        };
      })
    );
  }, []);

  const updateNote = useCallback((id: string, input: CreateNoteInput) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id
          ? {
              ...makeNote(input),
              id,
            }
          : note
      )
    );
  }, []);

  const duplicateNote = useCallback((id: string) => {
    setNotes((currentNotes) => {
      const original = currentNotes.find((note) => note.id === id);

      if (!original) {
        return currentNotes;
      }

      return [
        makeNote({
          body: original.body,
          decayStyle: original.decayStyle,
          durationMinutes: original.durationMinutes,
          imageUri: original.imageUri,
          themeId: original.themeId,
          title: `${original.title} copy`,
        }),
        ...currentNotes,
      ];
    });
  }, []);

  const extendNote = useCallback((id: string, minutes: number) => {
    const safeMinutes = Math.max(1, Math.round(minutes));
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              durationMinutes: note.durationMinutes + safeMinutes,
              isPreserved: false,
              preservedProgress: undefined,
            }
          : note
      )
    );
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
  }, []);

  const quickBurnNote = useCallback((id: string) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              createdAt: Date.now() - note.durationMinutes * 60 * 1000,
              isPreserved: false,
              preservedProgress: undefined,
            }
          : note
      )
    );
  }, []);

  const preserveNote = useCallback((id: string) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              isPreserved: true,
              preservedProgress: Math.max(0, Math.min((Date.now() - note.createdAt) / (note.durationMinutes * 60 * 1000), 1)),
            }
          : note
      )
    );
  }, []);

  const notesValue = useMemo<NotesValue>(() => ({
    notes,
    addNote,
    continueNote,
    duplicateNote,
    extendNote,
    preserveNote,
    quickBurnNote,
    removeNote,
    updateNote,
  }), [notes, addNote, continueNote, duplicateNote, extendNote, preserveNote, quickBurnNote, removeNote, updateNote]);

  const settingsValue = useMemo<SettingsValue>(() => ({
    appThemeId,
    appBackgroundStyle,
    ambientMotionEnabled,
    defaultDuration,
    defaultStyle,
    autoEraseEnabled,
    guideCompleted,
    hapticsEnabled,
    hydrated,
    soundEnabled,
    setAppThemeId,
    setAppBackgroundStyle,
    setAmbientMotionEnabled,
    setDefaultDuration,
    setDefaultStyle,
    setAutoEraseEnabled,
    setGuideCompleted,
    setHapticsEnabled,
    setSoundEnabled,
  }), [ambientMotionEnabled, appThemeId, appBackgroundStyle, defaultDuration, defaultStyle, autoEraseEnabled, guideCompleted, hapticsEnabled, hydrated, soundEnabled]);

  const profileValue = useMemo<ProfileValue>(() => ({
    profileName,
    profileBio,
    profileInitial,
    profileAvatarUri,
    setProfileName,
    setProfileBio,
    setProfileInitial,
    setProfileAvatarUri,
  }), [profileName, profileBio, profileInitial, profileAvatarUri]);

  return (
    <NotesContext.Provider value={notesValue}>
      <SettingsContext.Provider value={settingsValue}>
        <ProfileContext.Provider value={profileValue}>{children}</ProfileContext.Provider>
      </SettingsContext.Provider>
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const value = useContext(NotesContext);
  if (!value) throw new Error('useNotes must be used inside DhuloStoreProvider');
  return value;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside DhuloStoreProvider');
  return value;
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile must be used inside DhuloStoreProvider');
  return value;
}

// Backwards-compatible aggregated hook for existing callers
export function useDhuloStore() {
  const notes = useNotes();
  const settings = useSettings();
  const profile = useProfile();

  return {
    ...notes,
    ...settings,
    ...profile,
  } as unknown as {
    notes: DhuloNote[];
    appThemeId: ThemeId;
    appBackgroundStyle: AppBackgroundStyle;
    profileName: string;
    profileBio: string;
    profileInitial: string;
    profileAvatarUri?: string;
    defaultDuration: number;
    defaultStyle: DecayStyle;
    autoEraseEnabled: boolean;
    hapticsEnabled: boolean;
    soundEnabled: boolean;
    continueNote: (id: string) => void;
    addNote: (input: CreateNoteInput) => void;
    preserveNote: (id: string) => void;
    quickBurnNote: (id: string) => void;
    removeNote: (id: string) => void;
    setAppThemeId: (themeId: ThemeId) => void;
    setAppBackgroundStyle: (backgroundStyle: AppBackgroundStyle) => void;
    setProfileBio: (bio: string) => void;
    setProfileInitial: (initial: string) => void;
    setProfileName: (name: string) => void;
    setProfileAvatarUri: (uri?: string) => void;
    setDefaultDuration: (duration: number) => void;
    setDefaultStyle: (style: DecayStyle) => void;
    setAutoEraseEnabled: (enabled: boolean) => void;
    setHapticsEnabled: (enabled: boolean) => void;
    setSoundEnabled: (enabled: boolean) => void;
  };
}
