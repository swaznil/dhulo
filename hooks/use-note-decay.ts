import { useMemo } from 'react';

import { DhuloNote, getNoteProgress, getRemainingLabel } from '@/lib/dhulo';

export function useNoteDecay(note: DhuloNote, now: number) {
  return useMemo(() => {
    const progress = getNoteProgress(note, now);
    return {
      progress,
      isGone: progress >= 1,
      remainingLabel: getRemainingLabel(note, now),
    };
  }, [note, now]);
}
