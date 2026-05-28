import { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { DECAY_OPTIONS, DecayStyle, DhuloNote } from '@/lib/dhulo';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type DestroyCopy = {
  action: string;
  icon: IconName;
  shortAction: string;
};

export function getDestroyCopy(styleId: DecayStyle): DestroyCopy {
  if (styleId === 'ash') {
    return { action: 'Burn Note', icon: 'local-fire-department', shortAction: 'Burn' };
  }

  if (styleId === 'blur') {
    return { action: 'Clear Blurred Note', icon: 'blur-on', shortAction: 'Clear' };
  }

  if (styleId === 'scramble') {
    return { action: 'Scatter Scrambled Note', icon: 'shuffle', shortAction: 'Scatter' };
  }

  return { action: 'Release Drifted Note', icon: 'air', shortAction: 'Release' };
}

export function getDecayLabel(styleId: DecayStyle) {
  return DECAY_OPTIONS.find((option) => option.id === styleId)?.name ?? styleId;
}

export function splitColumns(notes: DhuloNote[]) {
  return notes.reduce<[DhuloNote[], DhuloNote[]]>(
    (columns, note, index) => {
      columns[index % 2].push(note);
      return columns;
    },
    [[], []]
  );
}

export function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours ? `${days}d ${remainingHours}h` : `${days}d`;
}

export function formatTimestamp(value: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export function durationToParts(totalMinutes: number) {
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes - days * 1440) / 60);
  const minutes = totalMinutes - days * 1440 - hours * 60;
  return { days, hours, minutes };
}

export function partsToDuration({
  days,
  hours,
  minutes,
}: {
  days: number;
  hours: number;
  minutes: number;
}) {
  return Math.max(1, days * 1440 + hours * 60 + minutes);
}

export function isWordHistoryBoundary(previousBody: string, nextBody: string) {
  if (Math.abs(nextBody.length - previousBody.length) > 24) {
    return true;
  }

  if (nextBody.length < previousBody.length) {
    return previousBody.endsWith(' ') || previousBody.endsWith('\n');
  }

  return /[\s.,!?;:)]$/.test(nextBody) && nextBody !== previousBody;
}
