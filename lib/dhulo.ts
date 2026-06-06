export type DecayStyle = 'ash' | 'blur' | 'drift' | 'scramble';

export type ThemeId =
  | 'obsidian'
  | 'graphite'
  | 'noir'
  | 'aurora'
  | 'moss'
  | 'paper'
  | 'daylight'
  | 'petal'
  | 'archive'
  | 'signal';

export type DhuloNote = {
  id: string;
  title: string;
  body: string;
  imageUri?: string;
  createdAt: number;
  durationMinutes: number;
  decayStyle: DecayStyle;
  themeId: ThemeId;
  isPreserved?: boolean;
  preservedProgress?: number;
};

export type DhuloTheme = {
  id: ThemeId;
  name: string;
  caption: string;
  mode: 'dark' | 'light';
  backgroundStyle: 'void' | 'mist' | 'paper' | 'garden' | 'signal' | 'hearts' | 'orbit' | 'blocks';
  background: string;
  surface: string;
  elevated: string;
  text: string;
  muted: string;
  faint: string;
  accent: string;
  secondary: string;
  border: string;
  shadow: string;
};

export type DecayOption = {
  id: DecayStyle;
  name: string;
  caption: string;
};

export const DHULO_THEMES: Record<ThemeId, DhuloTheme> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian',
    caption: 'Deep black, jade signal, quiet focus',
    mode: 'dark',
    backgroundStyle: 'void',
    background: '#030405',
    surface: '#101114',
    elevated: '#1b1d22',
    text: '#f4f6f8',
    muted: '#a9b0ba',
    faint: '#5e6672',
    accent: '#43F0BE',
    secondary: '#FFB86B',
    border: '#252830',
    shadow: '#000000',
  },
  graphite: {
    id: 'graphite',
    name: 'Graphite',
    caption: 'Matte grey, studio notebook',
    mode: 'dark',
    backgroundStyle: 'mist',
    background: '#111214',
    surface: '#1b1c20',
    elevated: '#292b31',
    text: '#f1f2f4',
    muted: '#b7bbc3',
    faint: '#6f747d',
    accent: '#d7dde8',
    secondary: '#93a4b8',
    border: '#33363e',
    shadow: '#050506',
  },
  noir: {
    id: 'noir',
    name: 'Noir',
    caption: 'Black ink, blue signal',
    mode: 'dark',
    backgroundStyle: 'signal',
    background: '#060911',
    surface: '#101522',
    elevated: '#1b2333',
    text: '#f4f8ff',
    muted: '#aeb9c9',
    faint: '#637188',
    accent: '#70d6ff',
    secondary: '#c9b8ff',
    border: '#273248',
    shadow: '#020409',
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    caption: 'Violet night, green pulse',
    mode: 'dark',
    backgroundStyle: 'orbit',
    background: '#10061f',
    surface: '#1b102c',
    elevated: '#2b1b43',
    text: '#f8f1ff',
    muted: '#c7b5dd',
    faint: '#7b6596',
    accent: '#76F7BF',
    secondary: '#B78CFF',
    border: '#3a2858',
    shadow: '#020706',
  },
  moss: {
    id: 'moss',
    name: 'Moss',
    caption: 'Deep green, living archive',
    mode: 'dark',
    backgroundStyle: 'garden',
    background: '#08120d',
    surface: '#111d16',
    elevated: '#1b2d22',
    text: '#eef8ef',
    muted: '#abc5ac',
    faint: '#667b69',
    accent: '#9fe29a',
    secondary: '#8cc8ff',
    border: '#2b4432',
    shadow: '#020805',
  },
  paper: {
    id: 'paper',
    name: 'Cloud',
    caption: 'Soft white, cool ink',
    mode: 'light',
    backgroundStyle: 'blocks',
    background: '#eef2f7',
    surface: '#fbfcff',
    elevated: '#e5ebf3',
    text: '#16191f',
    muted: '#677282',
    faint: '#9aa4b2',
    accent: '#315fbd',
    secondary: '#1f8f83',
    border: '#d7deea',
    shadow: '#b8c1ce',
  },
  daylight: {
    id: 'daylight',
    name: 'Daylight',
    caption: 'Warm paper, brass and teal',
    mode: 'light',
    backgroundStyle: 'paper',
    background: '#f8f4ec',
    surface: '#fffdf8',
    elevated: '#ece3d5',
    text: '#201a15',
    muted: '#776b5e',
    faint: '#aa9c8b',
    accent: '#b85d2f',
    secondary: '#2f7d7b',
    border: '#e2d6c5',
    shadow: '#c8b9a6',
  },
  petal: {
    id: 'petal',
    name: 'Petal',
    caption: 'Clean blush, soft hearts',
    mode: 'light',
    backgroundStyle: 'hearts',
    background: '#fff1f5',
    surface: '#fff9fb',
    elevated: '#f1dce5',
    text: '#291720',
    muted: '#7e6170',
    faint: '#ad91a0',
    accent: '#C9326B',
    secondary: '#2F80B9',
    border: '#ead0dc',
    shadow: '#d3b7c5',
  },
  archive: {
    id: 'archive',
    name: 'Archive',
    caption: 'Ledger green, abstract cards',
    mode: 'light',
    backgroundStyle: 'blocks',
    background: '#edf5ee',
    surface: '#fbfff8',
    elevated: '#dce9dc',
    text: '#172118',
    muted: '#667a68',
    faint: '#99aa9a',
    accent: '#2f8d5b',
    secondary: '#8a5bba',
    border: '#d0dfd0',
    shadow: '#b4c4b5',
  },
  signal: {
    id: 'signal',
    name: 'Signal',
    caption: 'Ink blue, golden lines',
    mode: 'dark',
    backgroundStyle: 'signal',
    background: '#061426',
    surface: '#111f30',
    elevated: '#1d3148',
    text: '#f2f8ff',
    muted: '#b2c5da',
    faint: '#6e849d',
    accent: '#FFD15C',
    secondary: '#4DD9FF',
    border: '#2a4059',
    shadow: '#02070d',
  },
};

export function normalizeThemeId(themeId?: string): ThemeId {
  if (themeId === 'ember') {
    return 'obsidian';
  }

  if (themeId === 'moon') {
    return 'noir';
  }

  if (themeId === 'garden') {
    return 'moss';
  }

  if (themeId && themeId in DHULO_THEMES) {
    return themeId as ThemeId;
  }

  return 'obsidian';
}

export function normalizeDecayStyle(style?: string): DecayStyle {
  if (style === 'ash' || style === 'blur' || style === 'drift' || style === 'scramble') {
    return style;
  }

  if (style === 'glitch') {
    return 'blur';
  }

  if (style === 'ember' || style === 'erase' || style === 'bleed') {
    return 'ash';
  }

  if (style === 'shatter') {
    return 'drift';
  }

  return 'drift';
}

export const DECAY_OPTIONS: DecayOption[] = [
  { id: 'ash', name: 'Ash', caption: 'Embers darken the page until it releases.' },
  { id: 'drift', name: 'Drift', caption: 'Letters pull apart and small pieces slip out.' },
  { id: 'blur', name: 'Blur', caption: 'The memory softens into atmosphere.' },
  { id: 'scramble', name: 'Scramble', caption: 'Letters lose their order before vanishing.' },
];

export const DURATION_PRESETS = [15, 30, 60, 180, 720, 1440];

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function getNoteProgress(note: DhuloNote, now: number) {
  if (note.isPreserved) {
    return clamp(note.preservedProgress ?? 0);
  }

  const durationMs = note.durationMinutes * 60 * 1000;
  return clamp((now - note.createdAt) / durationMs);
}

export function getRemainingLabel(note: DhuloNote, now: number) {
  if (note.isPreserved) {
    return 'preserved';
  }

  const remainingMs = Math.max(note.createdAt + note.durationMinutes * 60 * 1000 - now, 0);
  const remainingMinutes = Math.ceil(remainingMs / 60000);

  if (remainingMinutes <= 0) {
    return 'gone';
  }

  if (remainingMinutes < 60) {
    return `${remainingMinutes}m left`;
  }

  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  if (hours < 24) {
    return minutes ? `${hours}h ${minutes}m left` : `${hours}h left`;
  }

  const days = Math.floor(hours / 24);
  const dayHours = hours % 24;
  return dayHours ? `${days}d ${dayHours}h left` : `${days}d left`;
}

export function makeNote(input: {
  title: string;
  body: string;
  imageUri?: string;
  durationMinutes: number;
  decayStyle: DecayStyle;
  themeId: ThemeId;
  isPreserved?: boolean;
  preservedProgress?: number;
}): DhuloNote {
  return {
    id: `note-${Date.now()}-${Math.round(Math.random() * 100000)}`,
    title: input.title.trim() || 'Untitled release',
    body: input.body.trim(),
    imageUri: input.imageUri?.trim() || undefined,
    createdAt: Date.now(),
    durationMinutes: input.durationMinutes,
    decayStyle: input.decayStyle,
    themeId: normalizeThemeId(input.themeId),
    isPreserved: input.isPreserved,
    preservedProgress: input.preservedProgress,
  };
}

export function createSeedNotes(now: number): DhuloNote[] {
  return [
    {
      id: 'seed-1',
      title: 'Unsent sentence',
      body:
        'I can put this somewhere and let it stop being sharp. No archive, no performance, just a small release into time.',
      createdAt: now - 24 * 60 * 1000,
      durationMinutes: 90,
      decayStyle: 'ash',
      themeId: 'obsidian',
    },
    {
      id: 'seed-2',
      title: 'After the rain',
      body:
        'The street looked newly made tonight. I wanted to keep that feeling, but only for as long as it needed to stay.',
      createdAt: now - 2 * 60 * 60 * 1000,
      durationMinutes: 8 * 60,
      decayStyle: 'drift',
      themeId: 'noir',
    },
    {
      id: 'seed-3',
      title: 'Tiny permission',
      body:
        'Let this thought be true for a while. Let it loosen. Let it become less important without being judged.',
      createdAt: now - 9 * 60 * 1000,
      durationMinutes: 45,
      decayStyle: 'blur',
      themeId: 'moss',
    },
  ];
}

function seededNoise(seed: string, index: number) {
  let hash = 2166136261;
  const key = `${seed}:${index}`;

  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return ((hash >>> 0) % 10000) / 10000;
}

const ASH_CHARS = ['.', "'", '`', '^', ':', ' '];
const STATIC_CHARS = ['#', '%', '/', '?', '~', '+', '='];

function scrambleWord(word: string, seed: string, wordIndex: number, tick: number) {
  const characters = Array.from(word);

  if (characters.length < 4) {
    return characters.reverse().join('');
  }

  return characters
    .map((character, index) => ({
      character,
      order: seededNoise(`${seed}:${tick}:${wordIndex}`, index),
    }))
    .sort((a, b) => a.order - b.order)
    .map(({ character }) => character)
    .join('');
}

export function decayText(text: string, progress: number, style: DecayStyle, seed: string, tick = 0) {
  const amount = clamp(progress);

  if (style === 'scramble') {
    return text
      .split(/(\s+)/)
      .map((word, wordIndex) => {
        if (!word.trim()) {
          return word;
        }

        const stableNoise = seededNoise(seed, wordIndex);
        const motionNoise = seededNoise(`${seed}-${tick}`, wordIndex);

        if (stableNoise < amount * 0.2) {
          return Array.from(word)
            .map((_, index) => STATIC_CHARS[Math.floor(seededNoise(`${seed}:static:${tick}`, wordIndex + index) * STATIC_CHARS.length)])
            .join('');
        }

        if (stableNoise < amount * 1.05 || motionNoise < amount * 0.5) {
          return scrambleWord(word, seed, wordIndex, tick);
        }

        return word;
      })
      .join('');
  }

  if (style === 'drift') {
    return Array.from(text)
      .map((character, index) => {
        if (character === '\n') {
          return character;
        }

        const stableNoise = seededNoise(seed, index);
        const motionNoise = seededNoise(`${seed}-${tick}`, index);

        if (character !== ' ' && stableNoise < amount * 0.32) {
          return ' ';
        }

        const gapCount = stableNoise < amount * 0.72 || motionNoise < amount * 0.22 ? Math.min(4, 1 + Math.floor(amount * 5)) : 0;
        return character + ' '.repeat(gapCount);
      })
      .join('');
  }

  const vanishAt = style === 'ash' ? amount * 0.72 : amount * 0.42;

  return Array.from(text)
    .map((character, index) => {
      if (character === '\n' || character === ' ') {
        return character;
      }

      const stableNoise = seededNoise(seed, index);
      const motionNoise = seededNoise(`${seed}-${tick}`, index);

      if (style === 'ash' && stableNoise < vanishAt * 0.72) {
        return ' ';
      }

      if (style === 'ash') {
        if (stableNoise < amount * 0.96 || (amount > 0.58 && index % 11 === 0)) {
          return ASH_CHARS[Math.floor(motionNoise * ASH_CHARS.length)];
        }
        return character;
      }

      if (style === 'blur') {
        if (stableNoise < amount * 0.28) {
          return character.toLowerCase();
        }

        if (motionNoise < amount * 0.2) {
          return character === character.toUpperCase() ? character.toLowerCase() : character;
        }

        return character;
      }

      return character;
    })
    .join('');
}

export function getPreviewTitle(note: DhuloNote, now: number) {
  const progress = getNoteProgress(note, now);
  return decayText(note.title, progress * 0.72, note.decayStyle, `${note.id}-title`, Math.floor(now / 900));
}
